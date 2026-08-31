import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import {
  escapeLike,
  mapUser,
  mapVideos,
  type UserRow,
  type VideoRow,
} from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { env } = await getCtx();
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (!q) return jsonError("Search query required", 400);

  const viewer = await getSessionUser(env);
  const pattern = `%${escapeLike(q)}%`;

  const [videoRes, userRes] = await Promise.all([
    env.DB.prepare(
      "SELECT * FROM videos WHERE status = 'live' AND visibility = 'public' AND (caption LIKE ? ESCAPE '\\' OR hashtags LIKE ? ESCAPE '\\') ORDER BY id DESC LIMIT 30"
    )
      .bind(pattern, pattern)
      .all<VideoRow>(),
    env.DB.prepare(
      "SELECT * FROM users WHERE status = 'active' AND (username LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\') ORDER BY id DESC LIMIT 30"
    )
      .bind(pattern, pattern)
      .all<UserRow>(),
  ]);

  const [videos, users] = await Promise.all([
    mapVideos(env, videoRes.results ?? [], viewer?.id ?? null),
    Promise.all(
      (userRes.results ?? []).map((u) => mapUser(env, u, viewer?.id ?? null))
    ),
  ]);

  return json({ videos, users });
}
