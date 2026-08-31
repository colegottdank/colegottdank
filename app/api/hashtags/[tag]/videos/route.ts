import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { escapeLike, mapVideos, type VideoRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ tag: string }> };

export async function GET(request: Request, { params }: Params) {
  const { env } = await getCtx();
  const { tag: rawTag } = await params;
  // Param is the tag WITHOUT the leading '#'; tolerate one if the caller sends it.
  const tag = decodeURIComponent(rawTag).trim().replace(/^#/, "");
  if (!tag) return jsonError("Hashtag required", 400);

  const url = new URL(request.url);
  const sort = url.searchParams.get("sort") === "recent" ? "recent" : "top";
  const order = sort === "recent" ? "created_at DESC, id DESC" : "views DESC, id DESC";

  const viewer = await getSessionUser(env);
  // Whole-tag match against the space-separated hashtags column.
  const pattern = `% #${escapeLike(tag)} %`;
  const { results } = await env.DB.prepare(
    `SELECT * FROM videos WHERE status = 'live' AND visibility = 'public' AND (' ' || hashtags || ' ') LIKE ? ESCAPE '\\' ORDER BY ${order} LIMIT 30`
  )
    .bind(pattern)
    .all<VideoRow>();

  const videos = await mapVideos(env, results ?? [], viewer?.id ?? null);
  return json({ videos });
}
