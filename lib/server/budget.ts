import type { Env } from "./context";

/**
 * Site-wide daily ceilings. These are the hard stop on spend: no matter how
 * many accounts or IPs an attacker has, the site does at most this much
 * paid work per UTC day. Everything fails closed past the line.
 */
export const DAILY_LIMITS = {
  /** Videos accepted into R2 per day (25MB each -> <=750MB/day of storage growth). */
  uploads: 30,
  /** Workers AI inferences per day (text + vision). */
  ai_calls: 2000,
} as const;

export type Budget = keyof typeof DAILY_LIMITS;

/** Increment today's counter for `name`; true while still within the limit. */
export async function withinDailyBudget(env: Env, name: Budget): Promise<boolean> {
  const row = await env.DB.prepare(
    "INSERT INTO daily_counters (day, name, n) VALUES (date('now'), ?, 1) ON CONFLICT(day, name) DO UPDATE SET n = n + 1 RETURNING n"
  )
    .bind(name)
    .first<{ n: number }>();
  const n = row?.n ?? 0;
  if (n > DAILY_LIMITS[name]) {
    console.error(`daily budget exceeded: ${name} ${n}/${DAILY_LIMITS[name]}`);
    return false;
  }
  return true;
}

/** Today's counts (admin visibility). */
export async function dailyCounts(env: Env): Promise<Record<string, number>> {
  const { results } = await env.DB.prepare(
    "SELECT name, n FROM daily_counters WHERE day = date('now')"
  ).all<{ name: string; n: number }>();
  const out: Record<string, number> = {};
  for (const r of results ?? []) out[r.name] = r.n;
  return out;
}
