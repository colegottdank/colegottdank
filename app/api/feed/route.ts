import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { mapVideos, type VideoRow } from "@/lib/server/db";
import { scoredForYou, newFeedSeed, OFFSET_SPAN } from "@/lib/server/feed";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { env } = await getCtx();
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") === "following" ? "following" : "foryou";
  const cursorRaw = url.searchParams.get("cursor");
  const cursor = cursorRaw != null && cursorRaw !== "" ? Number(cursorRaw) : null;
  const limitRaw = Number(url.searchParams.get("limit") ?? "10");
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 10, 1), 30);

  const viewer = await getSessionUser(env);

  if (tab === "following") {
    if (!viewer) return jsonError("Authentication required", 401);
    // Cursor semantics: opaque id, descending. Chronological, unchanged.
    const idCursor = cursor && Number.isFinite(cursor) ? cursor : null;
    const sql = idCursor
      ? "SELECT v.* FROM videos v JOIN follows f ON f.followee_id = v.user_id WHERE f.follower_id = ? AND v.status = 'live' AND v.visibility = 'public' AND v.id < ? ORDER BY v.id DESC LIMIT ?"
      : "SELECT v.* FROM videos v JOIN follows f ON f.followee_id = v.user_id WHERE f.follower_id = ? AND v.status = 'live' AND v.visibility = 'public' ORDER BY v.id DESC LIMIT ?";
    const stmt = idCursor
      ? env.DB.prepare(sql).bind(viewer.id, idCursor, limit)
      : env.DB.prepare(sql).bind(viewer.id, limit);
    const { results } = await stmt.all<VideoRow>();
    const rows = results ?? [];
    const videos = await mapVideos(env, rows, viewer.id);
    // id cursor: last row's id, or null when the page wasn't full.
    const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;
    return json({ videos, nextCursor });
  }

  // For You: scored sampling. Cursor semantics: opaque seed*OFFSET_SPAN+offset
  // (NOT an id). No cursor = fresh session = new seed = new shuffle; within a
  // session the seed keeps pages consistent and duplicate-free.
  const packed = cursor != null && Number.isFinite(cursor) && cursor > 0 ? Math.floor(cursor) : null;
  const seed = packed ? Math.floor(packed / OFFSET_SPAN) : newFeedSeed();
  const offset = packed ? packed % OFFSET_SPAN : 0;
  const rows = await scoredForYou(env, viewer ?? null, seed, offset, limit);
  const videos = await mapVideos(env, rows, viewer?.id ?? null);
  const nextCursor = rows.length === limit ? seed * OFFSET_SPAN + offset + limit : null;
  return json({ videos, nextCursor });
}
