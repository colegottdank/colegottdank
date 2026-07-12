import { getCtx, json, jsonError } from "@/lib/server/context";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const { id } = await params;
  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return jsonError("Invalid video id", 400);

  // Best-effort, no auth. Only count views on live videos.
  try {
    await env.DB.prepare(
      "UPDATE videos SET views = views + 1 WHERE id = ? AND status = 'live'"
    )
      .bind(videoId)
      .run();
  } catch (err) {
    console.error("view increment error:", err);
  }
  return json({ ok: true });
}
