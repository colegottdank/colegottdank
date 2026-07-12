import { getCtx, json } from "@/lib/server/context";

export const dynamic = "force-dynamic";

interface SoundRow {
  name: string;
  videos: number;
  views: number;
}

export async function GET() {
  const { env } = await getCtx();
  const { results } = await env.DB.prepare(
    "SELECT sound_name AS name, COUNT(*) AS videos, SUM(views) AS views FROM videos WHERE status = 'live' AND visibility = 'public' AND sound_name != '' GROUP BY sound_name ORDER BY views DESC, videos DESC LIMIT 10"
  ).all<SoundRow>();

  const sounds = (results ?? []).map((r) => ({
    name: r.name,
    videos: r.videos,
    views: r.views ?? 0,
  }));
  return json({ sounds });
}
