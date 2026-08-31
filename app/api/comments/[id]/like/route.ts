import { getCtx, json, jsonError, type Env } from "@/lib/server/context";
import { requireAuth } from "@/lib/server/auth";
import { getCommentRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function likeCount(env: Env, commentId: number): Promise<number> {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM comment_likes WHERE comment_id = ?"
  )
    .bind(commentId)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

export async function POST(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const user = await requireAuth(env);
  if (!user) return jsonError("Authentication required", 401);
  const { id } = await params;
  const commentId = Number(id);
  if (!Number.isFinite(commentId)) return jsonError("Invalid comment id", 400);

  const comment = await getCommentRow(env, commentId);
  if (!comment || comment.status !== "live") return jsonError("Not found", 404);

  await env.DB.prepare(
    "INSERT OR IGNORE INTO comment_likes (user_id, comment_id) VALUES (?, ?)"
  )
    .bind(user.id, commentId)
    .run();

  return json({ likes: await likeCount(env, commentId) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const user = await requireAuth(env);
  if (!user) return jsonError("Authentication required", 401);
  const { id } = await params;
  const commentId = Number(id);
  if (!Number.isFinite(commentId)) return jsonError("Invalid comment id", 400);

  await env.DB.prepare(
    "DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?"
  )
    .bind(user.id, commentId)
    .run();

  return json({ likes: await likeCount(env, commentId) });
}
