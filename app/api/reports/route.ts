import { getCtx, json, jsonError, type Env } from "@/lib/server/context";
import { moderateImage, moderateText } from "@/lib/server/moderation";
import { createNotification } from "@/lib/server/notifications";
import { getVideoRow } from "@/lib/server/db";
import { getSessionUser } from "@/lib/server/auth";
import { overIpLimit } from "@/lib/server/ratelimit";
import { hasControlChars, hasLineBreaks } from "@/lib/server/validate";

export const dynamic = "force-dynamic";

const TARGET_TYPES = new Set(["video", "comment", "user"]);
const AUTO_HIDE_THRESHOLD = 3;
const MAX_REASON = 100;
const MAX_DETAILS = 1000;

export async function POST(request: Request) {
  const { env, ctx } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);

  if (await overIpLimit(env.WRITE_RL, "report")) {
    return jsonError("Too many requests", 429);
  }

  let body: {
    targetType?: unknown;
    targetId?: unknown;
    reason?: unknown;
    details?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const targetType = String(body.targetType ?? "");
  const targetId = Number(body.targetId);
  const reason = typeof body.reason === "string" ? body.reason.trim().slice(0, MAX_REASON) : "";
  const details =
    typeof body.details === "string"
      ? body.details.replace(/\r\n?/g, "\n").trim().slice(0, MAX_DETAILS)
      : "";

  if (!TARGET_TYPES.has(targetType)) return jsonError("Invalid targetType", 400);
  if (!Number.isInteger(targetId) || targetId <= 0) return jsonError("Invalid targetId", 400);
  if (!reason || hasControlChars(reason) || hasLineBreaks(reason)) {
    return jsonError("Reason required", 400);
  }
  if (hasControlChars(details)) return jsonError("Invalid details", 400);

  // One open report per reporter per target.
  const dup = await env.DB.prepare(
    "SELECT 1 AS x FROM reports WHERE reporter_id = ? AND target_type = ? AND target_id = ? AND status = 'open'"
  )
    .bind(user.id, targetType, targetId)
    .first();
  if (dup) return json({ ok: true });

  await env.DB.prepare(
    "INSERT INTO reports (reporter_id, target_type, target_id, reason, details) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(user.id, targetType, targetId, reason, details)
    .run();

  // At 3+ distinct established reporters: comments are hidden outright;
  // videos get an automatic AI re-check (nobody reviews a queue here).
  if (targetType === "comment") {
    await maybeAutoHide(env, targetType, targetId);
  } else if (targetType === "video") {
    if (await reportThresholdMet(env, targetType, targetId)) {
      ctx.waitUntil(recheckReportedVideo(env, targetId));
    }
  }

  return json({ ok: true });
}

/**
 * Zero-touch handling for a reported video: re-run moderation on the stored
 * thumbnail + caption. Definite fail -> removed (R2 kept for recovery) + owner
 * notified. Pass -> stays live. Either way the open reports are resolved so
 * the next report starts a fresh count. AI error -> reports stay open and the
 * next report retries.
 */
async function recheckReportedVideo(env: Env, videoId: number): Promise<void> {
  try {
    const video = await getVideoRow(env, videoId);
    if (!video || video.status !== "live") return;

    const checks: Promise<{ ok: boolean; errored?: boolean }>[] = [
      moderateText(env, [video.caption, video.hashtags, video.sound_name].filter(Boolean).join(" "), "caption"),
    ];
    if (video.thumb_key) {
      const obj = await env.MEDIA.get(video.thumb_key);
      if (obj) {
        const bytes = new Uint8Array(await obj.arrayBuffer());
        checks.push(moderateImage(env, bytes));
      }
    }
    const results = await Promise.all(checks);
    if (results.some((r) => r.errored)) return; // leave reports open; retried on the next report

    if (results.some((r) => !r.ok)) {
      await env.DB.prepare(
        "UPDATE videos SET status = 'removed' WHERE id = ? AND status = 'live'"
      )
        .bind(videoId)
        .run();
      await createNotification(env, { userId: video.user_id, type: "moderation", videoId });
    }
    await env.DB.prepare(
      "UPDATE reports SET status = 'resolved' WHERE target_type = 'video' AND target_id = ? AND status = 'open'"
    )
      .bind(videoId)
      .run();
  } catch (err) {
    console.error("recheckReportedVideo error:", err);
  }
}

/**
 * Only reporters whose account is at least a day old count, so three
 * freshly-made sock puppets cannot trigger anything.
 */
async function reportThresholdMet(
  env: Env,
  targetType: string,
  targetId: number
): Promise<boolean> {
  const row = await env.DB.prepare(
    "SELECT COUNT(DISTINCT r.reporter_id) AS c FROM reports r JOIN users u ON u.id = r.reporter_id WHERE r.target_type = ? AND r.target_id = ? AND r.status = 'open' AND u.status = 'active' AND u.created_at <= datetime('now','-1 day')"
  )
    .bind(targetType, targetId)
    .first<{ c: number }>();
  return (row?.c ?? 0) >= AUTO_HIDE_THRESHOLD;
}

async function maybeAutoHide(
  env: Env,
  targetType: string,
  targetId: number
): Promise<void> {
  if (!(await reportThresholdMet(env, targetType, targetId))) return;
  // Comments have no 'pending' state; hide via 'removed'.
  await env.DB.prepare(
    "UPDATE comments SET status = 'removed' WHERE id = ? AND status = 'live'"
  )
    .bind(targetId)
    .run();
}
