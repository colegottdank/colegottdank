import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { mapVideos, type VideoRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { env } = await getCtx();
  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") === "following" ? "following" : "foryou";
  const cursorRaw = url.searchParams.get("cursor");
  const cursor = cursorRaw ? Number(cursorRaw) : null;
  const limitRaw = Number(url.searchParams.get("limit") ?? "10");
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 10, 1), 30);

  const viewer = await getSessionUser(env);

  if (tab === "following") {
    if (!viewer) return jsonError("Authentication required", 401);
    const sql = cursor
      ? "SELECT v.* FROM videos v JOIN follows f ON f.followee_id = v.user_id WHERE f.follower_id = ? AND v.status = 'live' AND v.visibility = 'public' AND v.id < ? ORDER BY v.id DESC LIMIT ?"
      : "SELECT v.* FROM videos v JOIN follows f ON f.followee_id = v.user_id WHERE f.follower_id = ? AND v.status = 'live' AND v.visibility = 'public' ORDER BY v.id DESC LIMIT ?";
    const stmt = cursor
      ? env.DB.prepare(sql).bind(viewer.id, cursor, limit)
      : env.DB.prepare(sql).bind(viewer.id, limit);
    const { results } = await stmt.all<VideoRow>();
    return respond(env, results ?? [], viewer.id, limit);
  }

  const sql = cursor
    ? "SELECT * FROM videos WHERE status = 'live' AND visibility = 'public' AND id < ? ORDER BY id DESC LIMIT ?"
    : "SELECT * FROM videos WHERE status = 'live' AND visibility = 'public' ORDER BY id DESC LIMIT ?";
  const stmt = cursor
    ? env.DB.prepare(sql).bind(cursor, limit)
    : env.DB.prepare(sql).bind(limit);
  const { results } = await stmt.all<VideoRow>();
  return respond(env, results ?? [], viewer?.id ?? null, limit);
}

async function respond(
  env: CloudflareEnv,
  rows: VideoRow[],
  viewerId: number | null,
  limit: number
) {
  const videos = await mapVideos(env, rows, viewerId);
  const nextCursor = rows.length === limit ? rows[rows.length - 1].id : null;
  return json({ videos, nextCursor });
}
