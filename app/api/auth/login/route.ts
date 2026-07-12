import { getCtx, json, jsonError } from "@/lib/server/context";
import { createSession, verifyPassword } from "@/lib/server/auth";
import { getUserByUsername, mapUser } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { env } = await getCtx();
  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const username = (body.username ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!username || !password) {
    return jsonError("Username and password required", 400);
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
