import type { Env } from "./context";
import type { UserRow, VideoRow } from "./db";

// ---------------------------------------------------------------------------
// Scored "For You" ranking
// ---------------------------------------------------------------------------
//
// score = base / (ageHours + 6)^1.3
//   base = 4*likes + 6*comments + 5*saves + log10(views + 1)
// then: *1.5 if the creator is followed, *0.2 if the viewer already viewed it.
//
// Ordering is score-WEIGHTED SAMPLING (Efraimidis-Spirakis: sort by
// u^(1/score) with u from a seeded RNG), not a plain sort — so every feed
// session deals a fresh order biased toward high scores, TikTok-style. The
// seed rides inside the cursor (seed*OFFSET_SPAN + offset), which keeps
// pagination within one session deterministic and duplicate-free while a
// refresh (no cursor -> new seed) reshuffles. See API-CONTRACT.md.

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
  const scored = pool.map((row) => {
    const likes = row.like_count ?? 0;
    const comments = row.comment_count ?? 0;
    const saves = row.save_count ?? 0;
    const views = row.views ?? 0;
    const ageHours = Math.max(row.age_hours ?? 0, 0);

    const base = 4 * likes + 6 * comments + 5 * saves + Math.log10(views + 1);
    let score = base / Math.pow(ageHours + 6, 1.3);
    if (followed.has(row.user_id)) score *= 1.5;
    if (viewed.has(row.id)) score *= 0.2;

    // Weighted sampling without replacement: order by u^(1/w). Higher scores
    // win more often but never deterministically; epsilon keeps zero-engagement
    // videos in the lottery.
    const key = Math.pow(rand(), 1 / (score + 0.01));
    return { row, key };
  });

  scored.sort((a, b) => b.key - a.key);

  return scored.slice(offset, offset + limit).map((s) => stripCandidate(s.row));
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
