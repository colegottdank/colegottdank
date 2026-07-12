import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { getUserById, mapUser } from "@/lib/server/db";
import { moderateText } from "@/lib/server/moderation";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const { env } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);

  let body: { name?: string; bio?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const updates: string[] = [];
  const binds: unknown[] = [];
  const toModerate: string[] = [];

  if (body.name !== undefined) {
    const name = body.name.trim();
    if (!name || name.length > 60) return jsonError("Invalid name (max 60)", 400);
    updates.push("name = ?");
    binds.push(name);
    toModerate.push(name);
  }
  if (body.bio !== undefined) {
    const bio = body.bio.trim();
    if (bio.length > 300) return jsonError("Bio exceeds 300 characters", 400);
    updates.push("bio = ?");
    binds.push(bio);
    if (bio) toModerate.push(bio);
  }

  if (updates.length === 0) return jsonError("Nothing to update", 400);

  if (toModerate.length > 0) {
    const mod = await moderateText(env, toModerate.join(" "));
    if (!mod.ok) {
      return jsonError("Profile failed moderation", 422, { reason: mod.reason });
    }
  }

  binds.push(user.id);
  await env.DB.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`)
    .bind(...binds)
    .run();

  const row = await getUserById(env, user.id);
  const updated = await mapUser(env, row!, user.id);
  return json({ user: updated });
}
