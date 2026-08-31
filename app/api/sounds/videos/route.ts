import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { mapVideos, type VideoRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { env } = await getCtx();
  const url = new URL(request.url);
  const name = (url.searchParams.get("name") ?? "").trim();
  if (!name) return jsonError("Sound name required", 400);

  const sort = url.searchParams.get("sort") === "recent" ? "recent" : "top";
  const order = sort === "recent" ? "created_at DESC, id DESC" : "views DESC, id DESC";

  const viewer = await getSessionUser(env);
  const { results } = await env.DB.prepare(
    `SELECT * FROM videos WHERE status = 'live' AND visibility = 'public' AND sound_name = ? ORDER BY ${order} LIMIT 30`
  )
    .bind(name)
    .all<VideoRow>();

  const videos = await mapVideos(env, results ?? [], viewer?.id ?? null);
  return json({ videos });
}
