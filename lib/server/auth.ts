import { cookies } from "next/headers";
import type { Env } from "./context";
import { getUserById, type UserRow } from "./db";

const SESSION_COOKIE = "session";
const SESSION_TTL_DAYS = 30;
const PBKDF2_ITERATIONS = 100_000;

// ---------------------------------------------------------------------------
// Hex helpers
// ---------------------------------------------------------------------------

function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return toHex(arr);
}

// ---------------------------------------------------------------------------
// Password hashing (PBKDF2-SHA256, 100k iterations, per-user salt)
// ---------------------------------------------------------------------------

async function derive(password: string, saltHex: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: fromHex(saltHex) as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    key,
    256
  );
  return toHex(bits);
}

export async function hashPassword(
  password: string
): Promise<{ hash: string; salt: string }> {
  const salt = randomHex(16);
  const hash = await derive(password, salt);
  return { hash, salt };
}

/** Constant-time-ish compare of two equal-length hex digests. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPassword(
  password: string,
  saltHex: string,
  expectedHashHex: string
): Promise<boolean> {
  const actual = await derive(password, saltHex);
  return timingSafeEqual(actual, expectedHashHex);
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return toHex(digest);
}

/** Create a session row and set the cookie. Returns the raw token. */
export async function createSession(env: Env, userId: number): Promise<string> {
  const token = randomHex(32);
  const tokenHash = await sha256Hex(token);
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 86400_000);
  await env.DB.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)"
  )
    .bind(tokenHash, userId, expires.toISOString())
    .run();

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 86400,
  });
  return token;
}

/** Delete the current session (DB row + cookie). */
export async function destroySession(env: Env): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = await sha256Hex(token);
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
      .bind(tokenHash)
      .run();
  }
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Resolve the current session to a user row, or null. Bans -> null. */
export async function getSessionUser(env: Env): Promise<UserRow | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const row = await env.DB.prepare(
    "SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ?"
  )
    .bind(tokenHash, new Date().toISOString())
    .first<{ user_id: number }>();
  if (!row) return null;
  const user = await getUserById(env, row.user_id);
  if (!user || user.status === "banned") return null;
  return user;
}

/** Like getSessionUser but for endpoints that require auth. Returns null when absent. */
export async function requireAuth(env: Env): Promise<UserRow | null> {
  return getSessionUser(env);
}

/** Invalidate all sessions for a user (used on ban). */
export async function destroyAllSessions(env: Env, userId: number): Promise<void> {
  await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId).run();
}
