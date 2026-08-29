import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { getUserById, mapUser } from "@/lib/server/db";
import { moderateText } from "@/lib/server/moderation";
import { overIpLimit } from "@/lib/server/ratelimit";
import { hasControlChars, hasLineBreaks } from "@/lib/server/validate";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const { env } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);

  if (await overIpLimit(env.WRITE_RL, "profile")) {
    return jsonError("Too many requests", 429);
  }

  let body: { name?: unknown; bio?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const updates: string[] = [];
  const binds: unknown[] = [];
  const toModerate: string[] = [];

  if (body.name !== undefined) {
    if (typeof body.name !== "string") return jsonError("Invalid name (max 60)", 400);
    const name = body.name.trim();
    if (!name || name.length > 60 || hasControlChars(name) || hasLineBreaks(name)) {
      return jsonError("Invalid name (max 60)", 400);
    }
    updates.push("name = ?");
    binds.push(name);
    toModerate.push(name);
  }
  if (body.bio !== undefined) {
    if (typeof body.bio !== "string") return jsonError("Invalid bio", 400);
    const bio = body.bio.replace(/\r\n?/g, "\n").trim();
    if (bio.length > 300) return jsonError("Bio exceeds 300 characters", 400);
    if (hasControlChars(bio)) return jsonError("Invalid bio", 400);
    updates.push("bio = ?");
    binds.push(bio);
    if (bio) toModerate.push(bio);
  }

  if (updates.length === 0) return jsonError("Nothing to update", 400);

  if (toModerate.length > 0) {
    const mod = await moderateText(env, toModerate.join(" "), "profile");
    if (mod.errored) return jsonError(mod.reason ?? "Moderation unavailable", 503);
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
