import type { Env } from "./context";
import type { UserRow, VideoRow } from "./db";

// ---------------------------------------------------------------------------
// "For You" ranking, remix edition
// ---------------------------------------------------------------------------
//
// Every feed session (seed) rolls its own personality, so refreshes feel
// different instead of replaying one global leaderboard:
//
//   1. ARCHETYPE — the seed picks one of four scoring moods:
//        bangers    engagement-heavy, mild recency decay
//        fresh      strong recency bias
//        deep-cuts  boosts low-view videos (hidden gems)
//        chaos      near-uniform lottery
//   2. TEMPERATURE — the seed also draws t in [0.65, 1.45]; weights are raised
//      to 1/t, so some sessions are sharp, some mushy.
//   3. WEIGHTED SAMPLING — Efraimidis-Spirakis (sort by u^(1/w)) over the
//      candidate pool: high weights win more often, never deterministically.
//   4. DIVERSITY PASS — never more than 2 consecutive videos from one creator.
//   5. WILDCARDS — every 5th slot is an exploration pick pulled from the
//      below-median-views half of the pool, so new/quiet videos surface.
//
// Everything is a pure function of (seed, pool, viewer signals): pagination
// within one session stays deterministic and duplicate-free, while a refresh
// (no cursor -> new seed) deals a genuinely new hand. Cursor packing is
// unchanged: seed*OFFSET_SPAN + offset. See API-CONTRACT.md.

const CANDIDATE_POOL = 500;
export const OFFSET_SPAN = 100000; // cursor = seed * OFFSET_SPAN + offset
export const MAX_SEED = 89999;

export function newFeedSeed(): number {
  return 1 + Math.floor(Math.random() * MAX_SEED);
}

/** Deterministic PRNG (mulberry32) so one seed yields one stable ordering. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface CandidateRow extends VideoRow {
  like_count: number;
  comment_count: number;
  save_count: number;
  age_hours: number;
}

interface SessionMood {
  archetype: "bangers" | "fresh" | "deep-cuts" | "chaos";
  temperature: number;
}

/** The seed rolls the session's scoring personality. Exported for tests. */
export function sessionMood(rand: () => number): SessionMood {
  const roll = rand();
  const archetype =
    roll < 0.35 ? "bangers" : roll < 0.6 ? "fresh" : roll < 0.85 ? "deep-cuts" : "chaos";
  const temperature = 0.65 + rand() * 0.8; // [0.65, 1.45)
  return { archetype, temperature };
}

interface Signals {
  followed: Set<number>;
  viewed: Set<number>;
}

function weigh(row: CandidateRow, mood: SessionMood, signals: Signals): number {
  const likes = row.like_count ?? 0;
  const comments = row.comment_count ?? 0;
  const saves = row.save_count ?? 0;
  const views = row.views ?? 0;
  const ageHours = Math.max(row.age_hours ?? 0, 0);
  const engagement = 4 * likes + 6 * comments + 5 * saves + Math.log10(views + 1);

  let w: number;
  switch (mood.archetype) {
    case "bangers":
      w = Math.pow(engagement + 0.5, 1.2) / Math.pow(ageHours + 8, 0.9);
      break;
    case "fresh":
      w = (engagement + 2) / Math.pow(ageHours + 4, 1.8);
      break;
    case "deep-cuts":
      w = (engagement + 60 / (views + 12)) / Math.pow(ageHours + 8, 1.0);
      break;
    case "chaos":
      w = 1 + (0.15 * engagement) / Math.pow(ageHours + 8, 1.1);
      break;
  }

  if (signals.followed.has(row.user_id)) w *= 1.5;
  if (signals.viewed.has(row.id)) w *= 0.2;
  return w;
}

const MAX_CREATOR_RUN = 2;
const WILDCARD_EVERY = 5; // every 5th slot is an exploration pick

/**
 * Build the session's full ordering of the pool: sample -> diversity pass ->
 * wildcard injection. Pure in (seed via rand, pool, signals). Exported for tests.
 */
export function orderPool(
  pool: CandidateRow[],
  rand: () => number,
  mood: SessionMood,
  signals: Signals
): CandidateRow[] {
  if (pool.length === 0) return [];

  // 1-3. Weighted sampling without replacement, temperature applied.
  const keyed = pool.map((row) => {
    const w = Math.pow(Math.max(weigh(row, mood, signals), 0) + 0.01, 1 / mood.temperature);
    return { row, key: Math.pow(rand(), 1 / w) };
  });
  keyed.sort((a, b) => b.key - a.key);
  let order = keyed.map((k) => k.row);

  // 4. Diversity: cap consecutive same-creator runs at MAX_CREATOR_RUN.
  order = diversify(order);

  // 5. Wildcards: every 5th slot becomes an exploration pick from the
  // below-median-views half, shuffled by the same seeded rng.
  const sortedViews = order.map((r) => r.views ?? 0).sort((a, b) => a - b);
  const median = sortedViews[Math.floor(sortedViews.length / 2)] ?? 0;
  const quiet = order.filter((r) => (r.views ?? 0) <= median);
  for (let i = quiet.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [quiet[i], quiet[j]] = [quiet[j], quiet[i]];
  }
  const quietIds = new Set<number>();
  const picks: CandidateRow[] = [];
  for (const q of quiet) {
    if (picks.length >= Math.floor(order.length / WILDCARD_EVERY)) break;
    picks.push(q);
    quietIds.add(q.id);
  }
  if (picks.length > 0) {
    const rest = order.filter((r) => !quietIds.has(r.id));
    const merged: CandidateRow[] = [];
    let ri = 0;
    let pi = 0;
    for (let slot = 0; ri < rest.length || pi < picks.length; slot++) {
      const wildcardSlot = slot % WILDCARD_EVERY === WILDCARD_EVERY - 2; // slots 3, 8, 13...
      if (wildcardSlot && pi < picks.length) merged.push(picks[pi++]);
      else if (ri < rest.length) merged.push(rest[ri++]);
      else if (pi < picks.length) merged.push(picks[pi++]);
    }
    order = diversify(merged);
  }

  return order;
}

/** Stable pass that defers items to keep same-creator runs <= MAX_CREATOR_RUN. */
function diversify(order: CandidateRow[]): CandidateRow[] {
  const out: CandidateRow[] = [];
  const deferred: CandidateRow[] = [];
  const runOk = (row: CandidateRow) => {
    const n = out.length;
    return !(
      n >= MAX_CREATOR_RUN &&
      out[n - 1].user_id === row.user_id &&
      out[n - 2].user_id === row.user_id
    );
  };
  for (const row of order) {
    // Deferred items get first shot once the run breaks.
    while (deferred.length > 0 && runOk(deferred[0])) out.push(deferred.shift()!);
    if (runOk(row)) out.push(row);
    else deferred.push(row);
  }
  while (deferred.length > 0) {
    const i = deferred.findIndex(runOk);
    if (i === -1) {
      out.push(...deferred); // pool is dominated by one creator; give up gracefully
      break;
    }
    out.push(deferred.splice(i, 1)[0]);
  }
  return out;
}

/**
 * Rank the candidate pool and return the [offset, offset+limit) slice as
 * VideoRow[] in scored order. `viewer` is null for anonymous visitors.
 */
export async function scoredForYou(
  env: Env,
  viewer: UserRow | null,
  seed: number,
  offset: number,
  limit: number
): Promise<VideoRow[]> {
  const poolSql = `
    SELECT
      v.*,
      (SELECT COUNT(*) FROM likes l WHERE l.video_id = v.id) AS like_count,
      (SELECT COUNT(*) FROM comments c WHERE c.video_id = v.id AND c.status = 'live') AS comment_count,
      (SELECT COUNT(*) FROM saves s WHERE s.video_id = v.id) AS save_count,
      (julianday('now') - julianday(v.created_at)) * 24.0 AS age_hours
    FROM videos v
    WHERE v.status = 'live' AND v.visibility = 'public'
      ${viewer ? "AND v.user_id != ?" : ""}
    ORDER BY v.id DESC
    LIMIT ${CANDIDATE_POOL}
  `;

  const poolStmt = viewer
    ? env.DB.prepare(poolSql).bind(viewer.id)
    : env.DB.prepare(poolSql);
  const { results } = await poolStmt.all<CandidateRow>();
  const pool = results ?? [];

  // Logged-in signals: followed creators + already-viewed videos.
  let followed = new Set<number>();
  let viewed = new Set<number>();
  if (viewer) {
    const [followRes, viewRes] = await Promise.all([
      env.DB.prepare("SELECT followee_id FROM follows WHERE follower_id = ?")
        .bind(viewer.id)
        .all<{ followee_id: number }>(),
      env.DB.prepare("SELECT DISTINCT video_id FROM video_views WHERE user_id = ?")
        .bind(viewer.id)
        .all<{ video_id: number }>(),
    ]);
    followed = new Set((followRes.results ?? []).map((r) => r.followee_id));
    viewed = new Set((viewRes.results ?? []).map((r) => r.video_id));
  }

  const rand = mulberry32(seed);
  const mood = sessionMood(rand);
  const order = orderPool(pool, rand, mood, { followed, viewed });

  return order.slice(offset, offset + limit).map(stripCandidate);
}

/** Drop the score-only columns so the return matches VideoRow. */
function stripCandidate(row: CandidateRow): VideoRow {
  const { like_count, comment_count, save_count, age_hours, ...videoRow } = row;
  void like_count;
  void comment_count;
  void save_count;
  void age_hours;
  return videoRow;
}
