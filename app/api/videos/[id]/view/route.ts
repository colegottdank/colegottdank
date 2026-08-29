import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { overIpLimit } from "@/lib/server/ratelimit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const { id } = await params;
  const videoId = Number(id);
  if (!Number.isInteger(videoId) || videoId <= 0) return jsonError("Invalid video id", 400);

  // Best-effort, no auth. Same IP can only count a view on a video 3x / 10s,
  // which blunts refresh-spam against the ranking signal.
  if (await overIpLimit(env.VIEW_RL, `view:${videoId}`)) {
    return json({ ok: true });
  }

  // Only count views on live videos.
  const viewer = await getSessionUser(env);
  try {
    const res = await env.DB.prepare(
      "UPDATE videos SET views = views + 1 WHERE id = ? AND status = 'live'"
    )
      .bind(videoId)
      .run();
    if ((res.meta?.changes ?? 0) > 0) {
      // Log the impression for the scored feed (user_id NULL for anonymous).
      await env.DB.prepare(
        "INSERT INTO video_views (video_id, user_id) VALUES (?, ?)"
      )
        .bind(videoId, viewer?.id ?? null)
        .run();
    }
  } catch (err) {
    console.error("view increment error:", err);
  }
  return json({ ok: true });
}
