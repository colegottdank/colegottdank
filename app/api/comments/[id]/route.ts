import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { getCommentRow, getVideoRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);

  const { id } = await params;
  const commentId = Number(id);
  if (!Number.isFinite(commentId)) return jsonError("Invalid comment id", 400);

  const comment = await getCommentRow(env, commentId);
  if (!comment) return jsonError("Not found", 404);

  const isAuthor = comment.user_id === user.id;
  const isAdmin = user.is_admin === 1;
  let isVideoOwner = false;
  if (!isAuthor && !isAdmin) {
    const video = await getVideoRow(env, comment.video_id);
    isVideoOwner = video?.user_id === user.id;
  }
  if (!isAuthor && !isAdmin && !isVideoOwner) {
    return jsonError("Forbidden", 403);
  }

  await env.DB.prepare("UPDATE comments SET status = 'removed' WHERE id = ?")
    .bind(commentId)
    .run();

  return json({ ok: true });
}
