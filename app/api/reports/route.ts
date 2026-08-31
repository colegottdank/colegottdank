import { getCtx, json, jsonError, type Env } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { overIpLimit } from "@/lib/server/ratelimit";
import { hasControlChars, hasLineBreaks } from "@/lib/server/validate";

export const dynamic = "force-dynamic";

const TARGET_TYPES = new Set(["video", "comment", "user"]);
const AUTO_HIDE_THRESHOLD = 3;
const MAX_REASON = 100;
const MAX_DETAILS = 1000;

export async function POST(request: Request) {
  const { env } = await getCtx();
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

  // Auto-hide videos/comments at 3+ distinct open reports.
  if (targetType === "video" || targetType === "comment") {
    await maybeAutoHide(env, targetType, targetId);
  }

  return json({ ok: true });
}

/**
 * Auto-hide only counts reporters whose account is at least a day old, so
 * three freshly-made sock puppets cannot take down arbitrary content.
 */
async function maybeAutoHide(
  env: Env,
  targetType: string,
  targetId: number
): Promise<void> {
  const row = await env.DB.prepare(
    "SELECT COUNT(DISTINCT r.reporter_id) AS c FROM reports r JOIN users u ON u.id = r.reporter_id WHERE r.target_type = ? AND r.target_id = ? AND r.status = 'open' AND u.status = 'active' AND u.created_at <= datetime('now','-1 day')"
  )
    .bind(targetType, targetId)
    .first<{ c: number }>();
  if ((row?.c ?? 0) < AUTO_HIDE_THRESHOLD) return;

  if (targetType === "video") {
    // Hide pending for admin review (only if currently live).
    await env.DB.prepare(
      "UPDATE videos SET status = 'pending' WHERE id = ? AND status = 'live'"
    )
      .bind(targetId)
      .run();
  } else {
    // Comments have no 'pending' state; hide via 'removed' (see deviation note).
    await env.DB.prepare(
      "UPDATE comments SET status = 'removed' WHERE id = ? AND status = 'live'"
    )
      .bind(targetId)
      .run();
  }
}
