import { getCtx, json, jsonError } from "@/lib/server/context";
import { createSession, verifyPassword } from "@/lib/server/auth";
import { getUserByUsername, mapUser } from "@/lib/server/db";
import { overIpLimit } from "@/lib/server/ratelimit";
import { optString } from "@/lib/server/validate";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { env } = await getCtx();
  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const username = (optString(body.username) ?? "").toLowerCase().slice(0, 64);
  const password = typeof body.password === "string" ? body.password : "";
  if (!username || !password) {
    return jsonError("Username and password required", 400);
  }

  // Brute-force protection: 10 attempts / minute / IP. (No per-username
  // limiter: with a consume-on-check limiter that is a lockout DoS.)
  if (await overIpLimit(env.AUTH_RL, "login")) {
    return jsonError("Too many login attempts. Try again in a minute.", 429);
  }

  const row = await env.DB.prepare(
    "SELECT * FROM users WHERE username = ? COLLATE NOCASE"
  )
    .bind(username)
    .first<{
      id: number;
      password_hash: string;
      password_salt: string;
      status: string;
    }>();

  // Always run a verify to reduce timing signal on unknown usernames.
  const ok = row
    ? await verifyPassword(password, row.password_salt, row.password_hash)
    : await verifyPassword(password, "00", "00");

  if (!row || !ok) return jsonError("Invalid username or password", 401);
  if (row.status === "banned") return jsonError("Account is banned", 403);

  await createSession(env, row.id);
  const full = await getUserByUsername(env, username);
  const user = await mapUser(env, full!, row.id);
  return json({ user });
}
