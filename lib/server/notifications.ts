import type { Env } from "./context";

export interface NotifyInput {
  userId: number; // recipient
  type: "like" | "comment" | "follow" | "mention" | "moderation";
  actorId?: number | null;
  videoId?: number | null;
  commentId?: number | null;
}

/**
 * Insert a notification. No-ops when the actor is the recipient (don't notify
 * yourself). Best-effort: swallows DB errors so it never breaks the parent write.
 */
export async function createNotification(env: Env, input: NotifyInput): Promise<void> {
  if (input.actorId && input.actorId === input.userId) return;
  try {
    await env.DB.prepare(
      "INSERT INTO notifications (user_id, type, actor_id, video_id, comment_id) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(
        input.userId,
        input.type,
        input.actorId ?? null,
        input.videoId ?? null,
        input.commentId ?? null
      )
      .run();
  } catch (err) {
    console.error("createNotification error:", err);
  }
}

/** Extract @mentions from text and notify each mentioned user (best-effort). */
export async function notifyMentions(
  env: Env,
  text: string,
  actorId: number,
  videoId: number | null,
  commentId: number | null
): Promise<void> {
  const handles = new Set(
    (text.match(/@([a-z0-9_.]{3,24})/gi) ?? []).map((h) => h.slice(1).toLowerCase())
  );
  if (handles.size === 0) return;
  for (const handle of handles) {
    try {
      const user = await env.DB.prepare(
        "SELECT id FROM users WHERE username = ? COLLATE NOCASE"
      )
        .bind(handle)
        .first<{ id: number }>();
      if (user && user.id !== actorId) {
        await createNotification(env, {
          userId: user.id,
          type: "mention",
          actorId,
          videoId,
          commentId,
        });
      }
    } catch (err) {
      console.error("notifyMentions error:", err);
    }
  }
}
