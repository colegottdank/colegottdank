import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import {
  getVideoRow,
  getCommentTree,
  getCommentRow,
  mapSingleComment,
} from "@/lib/server/db";
import { moderateText } from "@/lib/server/moderation";
import { createNotification, notifyMentions } from "@/lib/server/notifications";
import { commentsLastMinute, MAX_COMMENTS_PER_MINUTE } from "@/lib/server/ratelimit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };
const MAX_TEXT = 500;

export async function GET(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const { id } = await params;
  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return jsonError("Invalid video id", 400);

  const viewer = await getSessionUser(env);
  const comments = await getCommentTree(env, videoId, viewer?.id ?? null);
  return json({ comments });
}

export async function POST(request: Request, { params }: Params) {
  const { env } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);

  const { id } = await params;
  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return jsonError("Invalid video id", 400);

  let body: { text?: string; parentId?: number | null };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  const text = (body.text ?? "").trim();
  if (!text) return jsonError("Comment text required", 400);
  if (text.length > MAX_TEXT) return jsonError("Comment exceeds 500 characters", 400);

  const video = await getVideoRow(env, videoId);
  if (!video || video.status !== "live") return jsonError("Not found", 404);
  if (video.allow_comments === 0) {
    return jsonError("Comments are disabled on this video", 403);
  }

  // Rate limit: 20 comments/min.
  if ((await commentsLastMinute(env, user.id)) >= MAX_COMMENTS_PER_MINUTE) {
    return jsonError("Comment rate limit reached (20/min)", 429);
  }

  // Validate parent (must belong to same video, be live, top-level for 1-deep nesting).
  let parentId: number | null = null;
  let parentCommenterId: number | null = null;
  if (body.parentId != null) {
    const parent = await getCommentRow(env, Number(body.parentId));
    if (!parent || parent.video_id !== videoId || parent.status !== "live") {
      return jsonError("Parent comment not found", 400);
    }
    // Collapse replies-of-replies onto the top-level parent (one level only).
    parentId = parent.parent_id ?? parent.id;
    parentCommenterId = parent.user_id;
  }

  // Sync text moderation.
  const mod = await moderateText(env, text);
  if (!mod.ok) return jsonError("Comment failed moderation", 422, { reason: mod.reason });

  const inserted = await env.DB.prepare(
    "INSERT INTO comments (video_id, user_id, parent_id, text, status) VALUES (?, ?, ?, ?, 'live') RETURNING id"
  )
    .bind(videoId, user.id, parentId, text)
    .first<{ id: number }>();
  if (!inserted) return jsonError("Failed to post comment", 500);

  // Notify video owner and, on a reply, the parent commenter.
  await createNotification(env, {
    userId: video.user_id,
    type: "comment",
    actorId: user.id,
    videoId,
    commentId: inserted.id,
  });
  if (parentCommenterId && parentCommenterId !== video.user_id) {
    await createNotification(env, {
      userId: parentCommenterId,
      type: "comment",
      actorId: user.id,
      videoId,
      commentId: inserted.id,
    });
  }
  await notifyMentions(env, text, user.id, videoId, inserted.id);

  const row = await getCommentRow(env, inserted.id);
  const comment = await mapSingleComment(env, row!, user.id);
  return json({ comment });
}
