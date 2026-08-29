import { getCtx, json, jsonError, type Env } from "@/lib/server/context";
import { requireAuth } from "@/lib/server/auth";
import { getVideoRow, mapVideo, normalizeHashtags } from "@/lib/server/db";
import { moderateText, moderateImage } from "@/lib/server/moderation";
import { createNotification } from "@/lib/server/notifications";
import {
  uploadsToday,
  MAX_UPLOADS_PER_DAY,
  overIpLimit,
} from "@/lib/server/ratelimit";
import { hasControlChars, hasLineBreaks } from "@/lib/server/validate";

export const dynamic = "force-dynamic";

// The request body is buffered in Worker memory (OpenNext + formData), so keep
// this well under the 128MB isolate limit.
const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25MB
const MAX_THUMB_BYTES = 3 * 1024 * 1024; // 3MB
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_CAPTION = 300;
const MAX_SOUND_NAME = 100;

/**
 * Verify the file's magic bytes match the declared type. `file.type` is
 * client-controlled, so this is what actually keeps HTML/SVG/etc out of R2.
 */
async function sniff(file: Blob, type: string): Promise<boolean> {
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (b.length < 12) return false;
  switch (type) {
    case "image/jpeg":
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case "video/webm":
      // EBML header
      return b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3;
    case "video/mp4":
      // ISO BMFF: bytes 4..8 are "ftyp"
      return b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70;
    default:
      return false;
  }
}

export async function POST(request: Request) {
  const { env, ctx } = await getCtx();
  const user = await requireAuth(env);
  if (!user) return jsonError("Authentication required", 401);

  if (await overIpLimit(env.WRITE_RL, "upload")) {
    return jsonError("Too many requests", 429);
  }

  // Rate limit: 5 uploads/day.
  if ((await uploadsToday(env, user.id)) >= MAX_UPLOADS_PER_DAY) {
    return jsonError("Upload limit reached (5/day)", 429);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Expected multipart/form-data", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Missing video file", 400);
  if (!VIDEO_TYPES.has(file.type)) {
    return jsonError("Video must be mp4 or webm", 415);
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return jsonError("Video exceeds 25MB", 413);
  }
  if (!(await sniff(file, file.type))) {
    return jsonError("File is not a valid mp4/webm video", 415);
  }

  const caption = String(form.get("caption") ?? "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, MAX_CAPTION + 1);
  if (caption.length > MAX_CAPTION) {
    return jsonError("Caption exceeds 300 characters", 400);
  }
  const hashtags = normalizeHashtags(form.get("hashtags"));
  const soundName = String(form.get("soundName") ?? form.get("sound_name") ?? "")
    .trim()
    .slice(0, MAX_SOUND_NAME);
  if (hasControlChars(caption) || hasControlChars(soundName) || hasLineBreaks(soundName)) {
    return jsonError("Invalid characters", 400);
  }
  const visibility =
    String(form.get("visibility") ?? "public") === "private" ? "private" : "public";
  const allowCommentsRaw = String(form.get("allowComments") ?? "true").toLowerCase();
  const allowComments = allowCommentsRaw === "false" || allowCommentsRaw === "0" ? 0 : 1;

  // Client-extracted first-frame thumbnail. REQUIRED: it is the only visual
  // signal the vision check gets, and there is no server-side frame extraction.
  const thumb = form.get("thumb");
  if (!(thumb instanceof File) || thumb.size === 0) {
    return jsonError("Missing thumbnail", 400);
  }
  if (thumb.type !== "image/jpeg") {
    return jsonError("Thumbnail must be image/jpeg", 415);
  }
  if (thumb.size > MAX_THUMB_BYTES) {
    return jsonError("Thumbnail exceeds 3MB", 413);
  }
  if (!(await sniff(thumb, "image/jpeg"))) {
    return jsonError("Thumbnail is not a valid JPEG", 415);
  }
  const thumbBytes = new Uint8Array(await thumb.arrayBuffer());

  // Sync text moderation of caption (+ hashtags, sound name). Fail-closed.
  const textMod = await moderateText(
    env,
    [caption, hashtags, soundName].filter(Boolean).join(" "),
    "caption"
  );
  if (textMod.errored) return jsonError(textMod.reason ?? "Moderation unavailable", 503);
  if (!textMod.ok) {
    return jsonError("Caption failed moderation", 422, { reason: textMod.reason });
  }

  // Store video to R2. Pass the Blob straight through (no arrayBuffer copy).
  const ext = file.type === "video/webm" ? "webm" : "mp4";
  const uuid = crypto.randomUUID();
  const r2Key = `videos/${user.id}/${uuid}.${ext}`;
  await env.MEDIA.put(r2Key, file, {
    httpMetadata: { contentType: file.type },
  });

  const thumbKey = `thumbs/${user.id}/${uuid}.jpg`;
  await env.MEDIA.put(thumbKey, thumbBytes, {
    httpMetadata: { contentType: "image/jpeg" },
  });

  // Nothing goes live until the async vision check below passes.
  const inserted = await env.DB.prepare(
    "INSERT INTO videos (user_id, r2_key, thumb_key, caption, hashtags, sound_name, visibility, allow_comments, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending') RETURNING id"
  )
    .bind(
      user.id,
      r2Key,
      thumbKey,
      caption,
      hashtags,
      soundName || "original sound",
      visibility,
      allowComments
    )
    .first<{ id: number }>();

  if (!inserted) return jsonError("Failed to create video", 500);
  const videoId = inserted.id;

  // Async thumbnail vision moderation.
  ctx.waitUntil(moderateThumb(env, videoId, user.id, thumbBytes));

  const row = await getVideoRow(env, videoId);
  const video = await mapVideo(env, row!, user.id);
  return json({ video });
}

/**
 * Fail-CLOSED thumbnail moderation. AI error -> keep pending (admin review).
 * Pass -> live + moderation notify. Refusal -> rejected + moderation notify.
 */
async function moderateThumb(
  env: Env,
  videoId: number,
  ownerId: number,
  bytes: Uint8Array
): Promise<void> {
  try {
    let result = await moderateImage(env, bytes);
    if (result.errored) {
      // One more try before we strand it in pending.
      await new Promise((r) => setTimeout(r, 1500));
      result = await moderateImage(env, bytes);
    }
    if (result.errored) {
      // Fail-closed: leave pending for admin. No status change.
      return;
    }
    if (result.ok) {
      await env.DB.prepare(
        "UPDATE videos SET status = 'live' WHERE id = ? AND status = 'pending'"
      )
        .bind(videoId)
        .run();
    } else {
      await env.DB.prepare(
        "UPDATE videos SET status = 'rejected' WHERE id = ? AND status = 'pending'"
      )
        .bind(videoId)
        .run();
    }
    await createNotification(env, {
      userId: ownerId,
      type: "moderation",
      videoId,
    });
  } catch (err) {
    console.error("moderateThumb error (leaving pending):", err);
  }
}
