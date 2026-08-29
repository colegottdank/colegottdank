import { headers } from "next/headers";
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

// ---------------------------------------------------------------------------
// Per-IP limits via the Workers Rate Limiting binding (see wrangler.jsonc).
// ---------------------------------------------------------------------------

/**
 * Client IP as set by the Cloudflare edge, or null if absent. No X-Forwarded-For
 * fallback: Cloudflare appends to a client-supplied XFF, so its first entry is
 * attacker-controlled.
 */
export async function clientIp(): Promise<string | null> {
  const h = await headers();
  return h.get("cf-connecting-ip") ?? null;
}

/** Per-IP limit: `prefix:<ip>`. False (allow) when the IP is unknown. */
export async function overIpLimit(
  limiter: RateLimit | undefined,
  prefix: string
): Promise<boolean> {
  const ip = await clientIp();
  if (!ip) return false;
  return overLimit(limiter, `${prefix}:${ip}`);
}

/**
 * true when `key` is over the limiter's quota. Fails OPEN if the binding is
 * missing (local dev without the binding) or the call throws, so a rate-limit
 * outage never takes the site down.
 */
export async function overLimit(
  limiter: RateLimit | undefined,
  key: string
): Promise<boolean> {
  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.error(`rate limiter binding missing for key ${key} (failing open)`);
    }
    return false;
  }
  try {
    const { success } = await limiter.limit({ key });
    return !success;
  } catch (err) {
    console.error("ratelimit error (failing open):", err);
    return false;
  }
}
