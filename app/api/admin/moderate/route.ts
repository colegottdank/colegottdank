import { getCtx, json, jsonError, type Env } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { destroyAllSessions } from "@/lib/server/auth";
import { getVideoRow, getCommentRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

const TARGET_TYPES = new Set(["video", "comment", "user"]);
const ACTIONS = new Set(["approve", "remove", "ban"]);

export async function POST(request: Request) {
  const { env } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);
  if (user.is_admin !== 1) return jsonError("Forbidden", 403);

  let body: { targetType?: string; targetId?: number; action?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const targetType = String(body.targetType ?? "");
  const targetId = Number(body.targetId);
  const action = String(body.action ?? "");

  if (!TARGET_TYPES.has(targetType)) return jsonError("Invalid targetType", 400);
  if (!Number.isFinite(targetId)) return jsonError("Invalid targetId", 400);
  if (!ACTIONS.has(action)) return jsonError("Invalid action", 400);

  if (targetType === "video") {
    const video = await getVideoRow(env, targetId);
    if (!video) return jsonError("Not found", 404);
    if (action === "approve") {
      await env.DB.prepare("UPDATE videos SET status = 'live' WHERE id = ?")
        .bind(targetId)
        .run();
    } else if (action === "remove") {
      await env.DB.prepare("UPDATE videos SET status = 'removed' WHERE id = ?")
        .bind(targetId)
        .run();
      await deleteR2(env, [video.r2_key, video.thumb_key]);
    } else {
      return jsonError("ban not valid for a video", 400);
    }
  } else if (targetType === "comment") {
    const comment = await getCommentRow(env, targetId);
    if (!comment) return jsonError("Not found", 404);
    if (action === "approve") {
      await env.DB.prepare("UPDATE comments SET status = 'live' WHERE id = ?")
        .bind(targetId)
        .run();
    } else if (action === "remove") {
      await env.DB.prepare("UPDATE comments SET status = 'removed' WHERE id = ?")
        .bind(targetId)
        .run();
    } else {
      return jsonError("ban not valid for a comment", 400);
    }
  } else {
    // user
    if (action === "ban") {
      await env.DB.prepare("UPDATE users SET status = 'banned' WHERE id = ?")
        .bind(targetId)
        .run();
      await destroyAllSessions(env, targetId);
    } else if (action === "approve") {
      await env.DB.prepare("UPDATE users SET status = 'active' WHERE id = ?")
        .bind(targetId)
        .run();
    } else {
      // remove on a user -> treat as ban.
      await env.DB.prepare("UPDATE users SET status = 'banned' WHERE id = ?")
        .bind(targetId)
        .run();
      await destroyAllSessions(env, targetId);
    }
  }

  // Resolve open reports on this target.
  await env.DB.prepare(
    "UPDATE reports SET status = 'resolved' WHERE target_type = ? AND target_id = ? AND status = 'open'"
  )
    .bind(targetType, targetId)
    .run();

  return json({ ok: true });
}

async function deleteR2(env: Env, keys: (string | null)[]): Promise<void> {
  try {
    await Promise.all(
      keys.filter((k): k is string => !!k).map((k) => env.MEDIA.delete(k))
    );
  } catch (err) {
    console.error("admin R2 delete error:", err);
  }
}
