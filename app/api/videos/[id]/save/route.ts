import { getCtx, json, jsonError, type Env } from "@/lib/server/context";
import { requireAuth } from "@/lib/server/auth";
import { getVideoRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

async function saveCount(env: Env, videoId: number): Promise<number> {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM saves WHERE video_id = ?"
  )
    .bind(videoId)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

export async function POST(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const user = await requireAuth(env);
  if (!user) return jsonError("Authentication required", 401);
  const { id } = await params;
  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return jsonError("Invalid video id", 400);

  const video = await getVideoRow(env, videoId);
  if (!video || video.status !== "live") return jsonError("Not found", 404);

  await env.DB.prepare(
    "INSERT OR IGNORE INTO saves (user_id, video_id) VALUES (?, ?)"
  )
    .bind(user.id, videoId)
    .run();

  return json({ saves: await saveCount(env, videoId) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const user = await requireAuth(env);
  if (!user) return jsonError("Authentication required", 401);
  const { id } = await params;
  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return jsonError("Invalid video id", 400);

  await env.DB.prepare("DELETE FROM saves WHERE user_id = ? AND video_id = ?")
    .bind(user.id, videoId)
    .run();

  return json({ saves: await saveCount(env, videoId) });
}
