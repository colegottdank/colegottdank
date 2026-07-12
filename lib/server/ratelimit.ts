import type { Env } from "./context";

/** Uploads today for a user. created_at is UTC 'YYYY-MM-DD HH:MM:SS'. */
export async function uploadsToday(env: Env, userId: number): Promise<number> {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM videos WHERE user_id = ? AND created_at >= date('now')"
  )
    .bind(userId)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

/** Comments in the last 60 seconds for a user. */
export async function commentsLastMinute(env: Env, userId: number): Promise<number> {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM comments WHERE user_id = ? AND created_at >= datetime('now','-1 minute')"
  )
    .bind(userId)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

export const MAX_UPLOADS_PER_DAY = 5;
export const MAX_COMMENTS_PER_MINUTE = 20;
