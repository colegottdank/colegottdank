import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { moderateText } from "@/lib/server/moderation";

export const dynamic = "force-dynamic";

interface CommentRescanRow {
  id: number;
  video_id: number;
  user_id: number;
  username: string;
  text: string;
  created_at: string;
}

interface UserRescanRow {
  id: number;
  username: string;
  name: string;
  bio: string;
  created_at: string;
}

const MAX_LIMIT = 20;
const BATCH = 10;

/**
 * Admin-only. GET = dry run: re-moderate live comments (or active users' names/bios)
 * newest first and report what the current filter would reject. Nothing changes.
 *   ?target=comments|users   ?limit=20 (max 20)   ?before=<id> for paging
 */
export async function GET(request: Request) {
  const { env } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);
  if (user.is_admin !== 1) return jsonError("Forbidden", 403);

  const url = new URL(request.url);
  const target = url.searchParams.get("target") === "users" ? "users" : "comments";
  const limitRaw = Number(url.searchParams.get("limit") ?? "20");
  const limit = Math.min(Math.max(Number.isFinite(limitRaw) ? limitRaw : 20, 1), MAX_LIMIT);
  const beforeRaw = Number(url.searchParams.get("before"));
  const before = Number.isInteger(beforeRaw) && beforeRaw > 0 ? beforeRaw : null;

  // Uniform shape: { id, label, text } so the moderation loop is shared.
  let items: Array<{ id: number; label: string; text: string; createdAt: string; kind: "comment" | "profile"; videoId?: number }>;
  if (target === "users") {
    const sql = before
      ? "SELECT id, username, name, bio, created_at FROM users WHERE status = 'active' AND is_admin = 0 AND id < ? ORDER BY id DESC LIMIT ?"
      : "SELECT id, username, name, bio, created_at FROM users WHERE status = 'active' AND is_admin = 0 ORDER BY id DESC LIMIT ?";
    const stmt = before ? env.DB.prepare(sql).bind(before, limit) : env.DB.prepare(sql).bind(limit);
    const { results } = await stmt.all<UserRescanRow>();
    items = (results ?? []).map((r) => ({
      id: r.id,
      label: r.username,
      text: [r.username, r.name, r.bio].filter(Boolean).join(" "),
      createdAt: r.created_at,
      kind: "profile",
    }));
  } else {
    const sql = before
      ? "SELECT c.id, c.video_id, c.user_id, u.username, c.text, c.created_at FROM comments c JOIN users u ON u.id = c.user_id WHERE c.status = 'live' AND c.id < ? ORDER BY c.id DESC LIMIT ?"
      : "SELECT c.id, c.video_id, c.user_id, u.username, c.text, c.created_at FROM comments c JOIN users u ON u.id = c.user_id WHERE c.status = 'live' ORDER BY c.id DESC LIMIT ?";
    const stmt = before ? env.DB.prepare(sql).bind(before, limit) : env.DB.prepare(sql).bind(limit);
    const { results } = await stmt.all<CommentRescanRow>();
    items = (results ?? []).map((r) => ({
      id: r.id,
      label: r.username,
      text: r.text,
      createdAt: r.created_at,
      kind: "comment",
      videoId: r.video_id,
    }));
  }

  const verdicts: Array<(typeof items)[number] & { ok: boolean; reason?: string; errored?: boolean }> = [];
  for (let i = 0; i < items.length; i += BATCH) {
    const batch = items.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map(async (r) => ({ ...r, ...(await moderateText(env, r.text, r.kind)) }))
    );
    verdicts.push(...results);
  }

  const flagged = verdicts.filter((v) => !v.ok && !v.errored);
  const errored = verdicts.filter((v) => v.errored);
  return json({
    target,
    scanned: verdicts.length,
    flaggedCount: flagged.length,
    erroredCount: errored.length,
    nextBefore: items.length === limit ? items[items.length - 1].id : null,
    flagged: flagged.map((v) => ({
      id: v.id,
      ...(v.videoId != null ? { videoId: v.videoId } : {}),
      [target === "users" ? "username" : "by"]: v.label,
      text: v.text,
      reason: v.reason,
      createdAt: v.createdAt,
    })),
    errored: errored.map((v) => v.id),
  });
}

/**
 * Admin-only. POST { target: "comments"|"users", ids: number[] }
 * comments -> status 'rejected'; users -> status 'banned' + sessions destroyed.
 */
export async function POST(request: Request) {
  const { env } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);
  if (user.is_admin !== 1) return jsonError("Forbidden", 403);

  let body: { target?: unknown; ids?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }
  const target = body.target === "users" ? "users" : "comments";
  const ids = Array.isArray(body.ids)
    ? body.ids.map(Number).filter((n) => Number.isInteger(n) && n > 0)
    : [];
  if (ids.length === 0) return jsonError("ids required", 400);
  if (ids.length > 500) return jsonError("Too many ids (max 500)", 400);

  const targetIds = target === "users" ? ids.filter((id) => id !== user.id) : ids; // never ban yourself
  if (targetIds.length === 0) return json({ ok: true, target, changed: 0 });
  const marks = targetIds.map(() => "?").join(",");

  let changed = 0;
  if (target === "users") {
    const res = await env.DB.prepare(
      `UPDATE users SET status = 'banned' WHERE id IN (${marks}) AND status = 'active' AND is_admin = 0`
    )
      .bind(...targetIds)
      .run();
    changed = res.meta?.changes ?? 0;
    await env.DB.prepare(`DELETE FROM sessions WHERE user_id IN (${marks})`)
      .bind(...targetIds)
      .run();
  } else {
    const res = await env.DB.prepare(
      `UPDATE comments SET status = 'rejected' WHERE id IN (${marks}) AND status = 'live'`
    )
      .bind(...targetIds)
      .run();
    changed = res.meta?.changes ?? 0;
  }
  return json({ ok: true, target, changed });
}
