import { getCtx, json, jsonError } from "@/lib/server/context";
import { createSession, hashPassword } from "@/lib/server/auth";
import { getUserByUsername, getUserById, mapUser } from "@/lib/server/db";
import { moderateText } from "@/lib/server/moderation";

export const dynamic = "force-dynamic";

const USERNAME_RE = /^[a-z0-9_.]{3,24}$/;

export async function POST(request: Request) {
  const { env } = await getCtx();
  let body: { username?: string; name?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const username = (body.username ?? "").trim().toLowerCase();
  const name = (body.name ?? "").trim();
  const password = body.password ?? "";

  if (!USERNAME_RE.test(username)) {
    return jsonError(
      "Username must be 3-24 chars: lowercase letters, numbers, _ or .",
      400
    );
  }
  if (!name || name.length > 60) {
    return jsonError("Name is required (max 60 chars)", 400);
  }
  if (password.length < 8) {
    return jsonError("Password must be at least 8 characters", 400);
  }

  const existing = await getUserByUsername(env, username);
  if (existing) return jsonError("Username is taken", 409);

  // Moderate username + name (fail-open on AI error).
  const mod = await moderateText(env, `${username} ${name}`);
  if (!mod.ok) {
    return jsonError("Username or name failed moderation", 422, {
      reason: mod.reason,
    });
  }

  const { hash, salt } = await hashPassword(password);
  const isAdmin = username === (env.ADMIN_USERNAME ?? "").toLowerCase() ? 1 : 0;

  const inserted = await env.DB.prepare(
    "INSERT INTO users (username, name, password_hash, password_salt, is_admin) VALUES (?, ?, ?, ?, ?) RETURNING id"
  )
    .bind(username, name, hash, salt, isAdmin)
    .first<{ id: number }>();

  if (!inserted) return jsonError("Failed to create account", 500);

  await createSession(env, inserted.id);
  const row = await getUserById(env, inserted.id);
  const user = await mapUser(env, row!, inserted.id);
  return json({ user });
}
