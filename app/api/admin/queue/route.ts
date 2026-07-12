import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { mapVideos, type VideoRow } from "@/lib/server/db";

export const dynamic = "force-dynamic";

interface ReportRow {
  id: number;
  reporter_id: number;
  target_type: string;
  target_id: number;
  reason: string;
  details: string;
  status: string;
  created_at: string;
}

export async function GET() {
  const { env } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);
  if (user.is_admin !== 1) return jsonError("Forbidden", 403);

  const { results: reportRows } = await env.DB.prepare(
    "SELECT * FROM reports WHERE status = 'open' ORDER BY created_at DESC LIMIT 200"
  ).all<ReportRow>();

  const reports = (reportRows ?? []).map((r) => ({
    id: r.id,
    reporterId: r.reporter_id,
    targetType: r.target_type,
    targetId: r.target_id,
    reason: r.reason,
    details: r.details,
    status: r.status,
    createdAt: r.created_at.includes("T")
      ? r.created_at
      : r.created_at.replace(" ", "T") + "Z",
  }));

  const { results: pending } = await env.DB.prepare(
    "SELECT * FROM videos WHERE status = 'pending' ORDER BY created_at DESC LIMIT 200"
  ).all<VideoRow>();

  const pendingVideos = await mapVideos(env, pending ?? [], user.id);

  return json({ reports, pendingVideos });
}
