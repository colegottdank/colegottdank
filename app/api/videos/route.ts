import { getCtx, json, jsonError, type Env } from "@/lib/server/context";
import { requireAuth } from "@/lib/server/auth";
import { getVideoRow, mapVideo, normalizeHashtags } from "@/lib/server/db";
import { moderateText, moderateImage } from "@/lib/server/moderation";
import { createNotification } from "@/lib/server/notifications";
import { uploadsToday, MAX_UPLOADS_PER_DAY } from "@/lib/server/ratelimit";

export const dynamic = "force-dynamic";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const MAX_CAPTION = 300;

export async function POST(request: Request) {
  const { env, ctx } = await getCtx();
  const user = await requireAuth(env);
  if (!user) return jsonError("Authentication required", 401);

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
    return jsonError("Video exceeds 100MB", 413);
  }

  const caption = String(form.get("caption") ?? "").slice(0, MAX_CAPTION + 1);
  if (caption.length > MAX_CAPTION) {
    return jsonError("Caption exceeds 300 characters", 400);
  }
  const hashtags = normalizeHashtags(form.get("hashtags"));
  const soundName = String(form.get("soundName") ?? form.get("sound_name") ?? "").trim();
  const visibility =
    String(form.get("visibility") ?? "public") === "private" ? "private" : "public";
  const allowCommentsRaw = String(form.get("allowComments") ?? "true").toLowerCase();
  const allowComments = allowCommentsRaw === "false" || allowCommentsRaw === "0" ? 0 : 1;

  // Sync text moderation of caption (+ hashtags, sound name).
  const parsedTags = JSON.parse(hashtags) as string[];
  const textMod = await moderateText(
    env,
    [caption, parsedTags.join(" "), soundName].filter(Boolean).join(" ")
  );
  if (!textMod.ok) {
    return jsonError("Caption failed moderation", 422, { reason: textMod.reason });
  }

  // Store video to R2.
  const ext = file.type === "video/webm" ? "webm" : "mp4";
  const uuid = crypto.randomUUID();
  const r2Key = `videos/${user.id}/${uuid}.${ext}`;
  const videoBytes = await file.arrayBuffer();
  await env.MEDIA.put(r2Key, videoBytes, {
    httpMetadata: { contentType: file.type },
  });

  // Optional client-extracted thumbnail.
  const thumb = form.get("thumb");
  let thumbKey: string | null = null;
  let thumbBytes: Uint8Array | null = null;
  if (thumb instanceof File && thumb.size > 0) {
    if (thumb.type !== "image/jpeg") {
      return jsonError("Thumbnail must be image/jpeg", 415);
    }
    thumbKey = `thumbs/${user.id}/${uuid}.jpg`;
    const buf = await thumb.arrayBuffer();
    thumbBytes = new Uint8Array(buf);
    await env.MEDIA.put(thumbKey, buf, {
      httpMetadata: { contentType: "image/jpeg" },
    });
  }

  // Insert row. No thumb -> caption already passed -> go live immediately.
  const initialStatus = thumbBytes ? "pending" : "live";
  const inserted = await env.DB.prepare(
    "INSERT INTO videos (user_id, r2_key, thumb_key, caption, hashtags, sound_name, visibility, allow_comments, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id"
  )
    .bind(
      user.id,
      r2Key,
      thumbKey,
      caption,
      hashtags,
      soundName || "original sound",
      visibility,
      allowComments,
      initialStatus
    )
    .first<{ id: number }>();

  if (!inserted) return jsonError("Failed to create video", 500);
  const videoId = inserted.id;

  // Async thumbnail vision moderation.
  if (thumbBytes) {
    ctx.waitUntil(moderateThumb(env, videoId, user.id, thumbBytes));
  }

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
    const result = await moderateImage(env, bytes);
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
