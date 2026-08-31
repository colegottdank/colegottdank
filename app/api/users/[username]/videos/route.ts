import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { getUserByUsername, mapVideos, type VideoRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ username: string }> };

export async function GET(request: Request, { params }: Params) {
  const { env } = await getCtx();
  const { username } = await params;
  const owner = await getUserByUsername(env, username);
  if (!owner) return jsonError("Not found", 404);

  const viewer = await getSessionUser(env);
  const isSelf = viewer?.id === owner.id;
  const isAdmin = viewer?.is_admin === 1;

  const url = new URL(request.url);
  const tab = url.searchParams.get("tab") ?? "videos";

  let rows: VideoRow[] = [];

  if (tab === "liked") {
    // Videos this user has liked. Public + live only.
    const { results } = await env.DB.prepare(
      "SELECT v.* FROM videos v JOIN likes l ON l.video_id = v.id WHERE l.user_id = ? AND v.status = 'live' AND v.visibility = 'public' ORDER BY l.created_at DESC"
    )
      .bind(owner.id)
      .all<VideoRow>();
    rows = results ?? [];
  } else if (tab === "saved") {
    // Saved = self only.
    if (!isSelf) return jsonError("Forbidden", 403);
    const { results } = await env.DB.prepare(
      "SELECT v.* FROM videos v JOIN saves s ON s.video_id = v.id WHERE s.user_id = ? AND v.status IN ('live','pending') ORDER BY s.created_at DESC"
    )
      .bind(owner.id)
      .all<VideoRow>();
    rows = results ?? [];
  } else {
    // tab=videos. Owner/admin sees pending+rejected too; others see live public.
    if (isSelf || isAdmin) {
      const { results } = await env.DB.prepare(
        "SELECT * FROM videos WHERE user_id = ? AND status != 'removed' ORDER BY id DESC"
      )
        .bind(owner.id)
        .all<VideoRow>();
      rows = results ?? [];
    } else {
      const { results } = await env.DB.prepare(
        "SELECT * FROM videos WHERE user_id = ? AND status = 'live' AND visibility = 'public' ORDER BY id DESC"
      )
        .bind(owner.id)
        .all<VideoRow>();
      rows = results ?? [];
    }
  }

  const videos = await mapVideos(env, rows, viewer?.id ?? null);
  return json({ videos });
}
