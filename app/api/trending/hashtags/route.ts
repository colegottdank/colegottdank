import { getCtx, json } from "@/lib/server/context";

export const dynamic = "force-dynamic";

interface TagRow {
  tag: string;
  videos: number;
  views: number;
}

// Split the space-separated `hashtags` column into one row per tag with a
// recursive CTE, then aggregate. Single query, no N+1.
const SQL = `
WITH RECURSIVE live AS (
  SELECT id, views, trim(hashtags) AS tags
  FROM videos
  WHERE status = 'live' AND visibility = 'public' AND trim(hashtags) != ''
),
split(id, views, tag, rest) AS (
  SELECT id, views,
    CASE WHEN instr(tags, ' ') > 0 THEN substr(tags, 1, instr(tags, ' ') - 1) ELSE tags END,
    CASE WHEN instr(tags, ' ') > 0 THEN substr(tags, instr(tags, ' ') + 1) ELSE '' END
  FROM live
  UNION ALL
  SELECT id, views,
    CASE WHEN instr(rest, ' ') > 0 THEN substr(rest, 1, instr(rest, ' ') - 1) ELSE rest END,
    CASE WHEN instr(rest, ' ') > 0 THEN substr(rest, instr(rest, ' ') + 1) ELSE '' END
  FROM split
  WHERE rest != ''
)
SELECT
  CASE WHEN substr(tag, 1, 1) = '#' THEN substr(tag, 2) ELSE tag END AS tag,
  COUNT(*) AS videos,
  SUM(views) AS views
FROM split
WHERE tag != ''
GROUP BY 1
ORDER BY views DESC, videos DESC
LIMIT 10
`;

export async function GET() {
  const { env } = await getCtx();
  const { results } = await env.DB.prepare(SQL).all<TagRow>();
  const hashtags = (results ?? []).map((r) => ({
    tag: r.tag,
    videos: r.videos,
    views: r.views ?? 0,
  }));
  return json({ hashtags });
}
