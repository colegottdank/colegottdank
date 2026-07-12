import { getCtx, json, jsonError, type Env } from "@/lib/server/context";
import { requireAuth } from "@/lib/server/auth";
import { getUserByUsername } from "@/lib/server/db";
import { createNotification } from "@/lib/server/notifications";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ username: string }> };

async function followerCount(env: Env, userId: number): Promise<number> {
  const row = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM follows WHERE followee_id = ?"
  )
    .bind(userId)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

export async function POST(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const user = await requireAuth(env);
  if (!user) return jsonError("Authentication required", 401);

  const { username } = await params;
  const target = await getUserByUsername(env, username);
  if (!target) return jsonError("Not found", 404);
  if (target.id === user.id) return jsonError("Cannot follow yourself", 400);

  await env.DB.prepare(
    "INSERT OR IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)"
  )
    .bind(user.id, target.id)
    .run();

  await createNotification(env, {
    userId: target.id,
    type: "follow",
    actorId: user.id,
  });

  return json({ followers: await followerCount(env, target.id) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const user = await requireAuth(env);
  if (!user) return jsonError("Authentication required", 401);

  const { username } = await params;
  const target = await getUserByUsername(env, username);
  if (!target) return jsonError("Not found", 404);

  await env.DB.prepare(
    "DELETE FROM follows WHERE follower_id = ? AND followee_id = ?"
  )
    .bind(user.id, target.id)
    .run();

  return json({ followers: await followerCount(env, target.id) });
}
