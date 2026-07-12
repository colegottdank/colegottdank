import type { Metadata } from "next";
import { getCtx } from "@/lib/server/context";
import { getVideoRow } from "@/lib/server/db";
import ShareRedirect from "./redirect";

export const dynamic = "force-dynamic";

const SITE = "https://colegottdank.com";

type Params = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const fallback: Metadata = { title: "colegottdank.com" };

  const videoId = Number(id);
  if (!Number.isFinite(videoId)) return fallback;

  try {
    const { env } = await getCtx();
    const row = await getVideoRow(env, videoId);

    // Only live + public videos get rich cards.
    if (!row || row.status !== "live" || row.visibility !== "public") {
      return fallback;
    }

    const owner = await env.DB.prepare("SELECT username FROM users WHERE id = ?")
      .bind(row.user_id)
      .first<{ username: string }>();
    const username = owner?.username ?? "unknown";

    const title = `@${username} on colegottdank.com`;
    const description = row.caption || `Watch @${username} on colegottdank.com`;
    const image = row.thumb_key ? `${SITE}/api/media/${row.thumb_key}` : undefined;
    const url = `${SITE}/v/${videoId}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "video.other",
        url,
        ...(image ? { images: [{ url: image }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return fallback;
  }
}

export default async function SharePage({ params }: Params) {
  const { id } = await params;
  return <ShareRedirect id={id} />;
}
