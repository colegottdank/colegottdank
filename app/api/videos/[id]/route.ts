import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { getVideoRow, mapVideo } from "@/lib/server/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const { id } = await params;
  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return jsonError("Invalid video id", 400);

  const row = await getVideoRow(env, videoId);
  if (!row) return jsonError("Not found", 404);

  const viewer = await getSessionUser(env);
  const isOwner = viewer?.id === row.user_id;
  const isAdmin = viewer?.is_admin === 1;
  // 404 unless live, owner, or admin.
  if (row.status !== "live" && !isOwner && !isAdmin) {
    return jsonError("Not found", 404);
  }

  const video = await mapVideo(env, row, viewer?.id ?? null);
  return json({ video });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const { id } = await params;
  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return jsonError("Invalid video id", 400);

  const viewer = await getSessionUser(env);
  if (!viewer) return jsonError("Authentication required", 401);

  const row = await getVideoRow(env, videoId);
  if (!row) return jsonError("Not found", 404);

  const isOwner = viewer.id === row.user_id;
  const isAdmin = viewer.is_admin === 1;
  if (!isOwner && !isAdmin) return jsonError("Forbidden", 403);

  await env.DB.prepare("UPDATE videos SET status = 'removed' WHERE id = ?")
    .bind(videoId)
    .run();

  // Delete R2 objects (best-effort).
  try {
    const keys = [row.r2_key, row.thumb_key].filter(Boolean) as string[];
    await Promise.all(keys.map((k) => env.MEDIA.delete(k)));
  } catch (err) {
    console.error("R2 delete error:", err);
  }

  return json({ ok: true });
}
