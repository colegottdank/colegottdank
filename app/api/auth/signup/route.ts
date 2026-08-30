import { getCtx, json, jsonError } from "@/lib/server/context";
import { createSession, hashPassword } from "@/lib/server/auth";
import { getUserByUsername, getUserById, mapUser } from "@/lib/server/db";
import { moderateText } from "@/lib/server/moderation";
import { clientIp, overIpLimit } from "@/lib/server/ratelimit";
import { verifyTurnstile } from "@/lib/server/turnstile";
import { hasControlChars, hasLineBreaks, optString } from "@/lib/server/validate";

export const dynamic = "force-dynamic";

const USERNAME_RE = /^[a-z0-9_.]{3,24}$/;
const MAX_PASSWORD = 256;

export async function POST(request: Request) {
  const { env } = await getCtx();

  // Account-creation spam: 10 signups / minute / IP.
  if (await overIpLimit(env.AUTH_RL, "signup")) {
    return jsonError("Too many signups from this network. Try again in a minute.", 429);
  }

  let body: { username?: unknown; name?: unknown; password?: unknown; turnstileToken?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const username = (optString(body.username) ?? "").toLowerCase();
  const name = optString(body.name) ?? "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!USERNAME_RE.test(username)) {
    return jsonError(
      "Username must be 3-24 chars: lowercase letters, numbers, _ or .",
      400
    );
  }
  if (!name || name.length > 60 || hasControlChars(name) || hasLineBreaks(name)) {
    return jsonError("Name is required (max 60 chars)", 400);
  }
  if (password.length < 8 || password.length > MAX_PASSWORD) {
    return jsonError("Password must be 8-256 characters", 400);
  }

  const existing = await getUserByUsername(env, username);
  if (existing) return jsonError("Username is taken", 409);

  // Bot check before we spend a moderation call.
  const bot = await verifyTurnstile(env, body.turnstileToken, await clientIp());
  if (!bot.ok) return jsonError(bot.reason ?? "Bot check failed", 400);

  // Moderate username + name. Fail-closed.
  const mod = await moderateText(env, `${username} ${name}`, "profile");
  if (mod.errored) return jsonError(mod.reason ?? "Moderation unavailable", 503);
  if (!mod.ok) {
    return jsonError("Username or name failed moderation", 422, {
      reason: mod.reason,
    });
  }

  const { hash, salt } = await hashPassword(password);
  // Bootstrap-only: ADMIN_USERNAME grants admin solely while no admin exists,
  // so the name cannot be squatted for escalation later.
  let isAdmin = 0;
  if (username === (env.ADMIN_USERNAME ?? "").toLowerCase()) {
    const existingAdmin = await env.DB.prepare(
      "SELECT 1 AS x FROM users WHERE is_admin = 1 LIMIT 1"
    ).first();
    isAdmin = existingAdmin ? 0 : 1;
  }

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
