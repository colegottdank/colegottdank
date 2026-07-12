import { getCtx, json, jsonError, type Env } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

const TARGET_TYPES = new Set(["video", "comment", "user"]);
const AUTO_HIDE_THRESHOLD = 3;

export async function POST(request: Request) {
  const { env } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);

  let body: {
    targetType?: string;
    targetId?: number;
    reason?: string;
    details?: string;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const targetType = String(body.targetType ?? "");
  const targetId = Number(body.targetId);
  const reason = String(body.reason ?? "").trim();
  const details = String(body.details ?? "").trim().slice(0, 1000);

  if (!TARGET_TYPES.has(targetType)) return jsonError("Invalid targetType", 400);
  if (!Number.isFinite(targetId)) return jsonError("Invalid targetId", 400);
  if (!reason) return jsonError("Reason required", 400);

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

async function maybeAutoHide(
  env: Env,
  targetType: string,
  targetId: number
): Promise<void> {
  const row = await env.DB.prepare(
    "SELECT COUNT(DISTINCT reporter_id) AS c FROM reports WHERE target_type = ? AND target_id = ? AND status = 'open'"
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
