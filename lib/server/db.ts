import type { Env } from "./context";

// ---------------------------------------------------------------------------
// Row types (raw D1 shapes)
// ---------------------------------------------------------------------------

export interface UserRow {
  id: number;
  username: string;
  name: string;
  bio: string;
  avatar_key: string | null;
  is_admin: number;
  is_private: number;
  status: string; // 'active' | 'banned'
  created_at: string;
}

export interface VideoRow {
  id: number;
  user_id: number;
  r2_key: string;
  thumb_key: string | null;
  caption: string;
  hashtags: string;
  sound_name: string;
  visibility: string; // 'public' | 'private'
  allow_comments: number;
  status: string; // 'pending' | 'live' | 'rejected' | 'removed'
  views: number;
  created_at: string;
}

export interface CommentRow {
  id: number;
  video_id: number;
  user_id: number;
  parent_id: number | null;
  text: string;
  status: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Output shapes (API contract)
// ---------------------------------------------------------------------------

export interface UserShape {
  id: number;
  username: string;
  name: string;
  bio: string;
  avatarUrl: string;
  verified: boolean;
  isAdmin: boolean;
  followers: number;
  following: number;
  likes: number;
  videos: number;
  me?: { following: boolean };
}

export interface VideoShape {
  id: number;
  url: string;
  thumbUrl: string | null;
  caption: string;
  hashtags: string[];
  soundName: string;
  status: string;
  user: {
    id: number;
    username: string;
    name: string;
    avatarUrl: string;
    verified: boolean;
  };
  likes: number;
  comments: number;
  saves: number;
  views: number;
  createdAt: string;
  me?: { liked: boolean; saved: boolean; following: boolean };
}

export interface CommentShape {
  id: number;
  videoId: number;
  parentId: number | null;
  text: string;
  likes: number;
  createdAt: string;
  user: { id: number; username: string; name: string; avatarUrl: string };
  me?: { liked: boolean };
  replies?: CommentShape[];
}

export interface NotificationShape {
  id: number;
  type: string;
  read: boolean;
  createdAt: string;
  actor?: { username: string; name: string; avatarUrl: string };
  videoId?: number;
  text: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** dicebear avatar URL, seeded by username (matches frontend seed style). */
export function avatarUrl(username: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
    username
  )}&backgroundColor=b6e3f4`;
}

/** ISO 8601 UTC. D1 stores `YYYY-MM-DD HH:MM:SS` (UTC via datetime('now')). */
export function toISO(dbTime: string | null | undefined): string {
  if (!dbTime) return new Date().toISOString();
  // Already ISO?
  if (dbTime.includes("T")) return dbTime;
  return dbTime.replace(" ", "T") + "Z";
}

function parseHashtags(raw: string): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // fall through to whitespace split
  }
  return trimmed.split(/\s+/).filter(Boolean);
}

/** Normalize user-supplied hashtags (string or array) into a stored JSON array. */
export function normalizeHashtags(input: unknown): string {
  let tags: string[] = [];
  if (Array.isArray(input)) {
    tags = input.map(String);
  } else if (typeof input === "string") {
    tags = input.split(/[\s,]+/).filter(Boolean);
  }
  const cleaned = tags
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("#") ? t : `#${t}`))
    .slice(0, 30);
  return JSON.stringify(cleaned);
}

async function count(env: Env, sql: string, ...binds: unknown[]): Promise<number> {
  const row = await env.DB.prepare(sql)
    .bind(...binds)
    .first<{ c: number }>();
  return row?.c ?? 0;
}

async function exists(env: Env, sql: string, ...binds: unknown[]): Promise<boolean> {
  const row = await env.DB.prepare(sql)
    .bind(...binds)
    .first<{ x: number }>();
  return !!row;
}

// ---------------------------------------------------------------------------
// User queries + mapping
// ---------------------------------------------------------------------------

export async function getUserById(env: Env, id: number): Promise<UserRow | null> {
  return env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<UserRow>();
}

export async function getUserByUsername(
  env: Env,
  username: string
): Promise<UserRow | null> {
  return env.DB.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE")
    .bind(username)
    .first<UserRow>();
}

export async function mapUser(
  env: Env,
  row: UserRow,
  viewerId?: number | null
): Promise<UserShape> {
  const [followers, following, likes, videos] = await Promise.all([
    count(env, "SELECT COUNT(*) AS c FROM follows WHERE followee_id = ?", row.id),
    count(env, "SELECT COUNT(*) AS c FROM follows WHERE follower_id = ?", row.id),
    count(
      env,
      "SELECT COUNT(*) AS c FROM likes l JOIN videos v ON l.video_id = v.id WHERE v.user_id = ? AND v.status = 'live'",
      row.id
    ),
    count(
      env,
      "SELECT COUNT(*) AS c FROM videos WHERE user_id = ? AND status = 'live'",
      row.id
    ),
  ]);

  const shape: UserShape = {
    id: row.id,
    username: row.username,
    name: row.name,
    bio: row.bio,
    avatarUrl: avatarUrl(row.username),
    verified: row.is_admin === 1,
    isAdmin: row.is_admin === 1,
    followers,
    following,
    likes,
    videos,
  };

  if (viewerId) {
    const isFollowing = await exists(
      env,
      "SELECT 1 AS x FROM follows WHERE follower_id = ? AND followee_id = ?",
      viewerId,
      row.id
    );
    shape.me = { following: isFollowing };
  }

  return shape;
}

// ---------------------------------------------------------------------------
// Video queries + mapping
// ---------------------------------------------------------------------------

export async function getVideoRow(env: Env, id: number): Promise<VideoRow | null> {
  return env.DB.prepare("SELECT * FROM videos WHERE id = ?").bind(id).first<VideoRow>();
}

export async function mapVideo(
  env: Env,
  row: VideoRow,
  viewerId?: number | null
): Promise<VideoShape> {
  const owner = await getUserById(env, row.user_id);
  const [likes, comments, saves] = await Promise.all([
    count(env, "SELECT COUNT(*) AS c FROM likes WHERE video_id = ?", row.id),
    count(
      env,
      "SELECT COUNT(*) AS c FROM comments WHERE video_id = ? AND status = 'live'",
      row.id
    ),
    count(env, "SELECT COUNT(*) AS c FROM saves WHERE video_id = ?", row.id),
  ]);

  const shape: VideoShape = {
    id: row.id,
    url: `/api/media/${row.r2_key}`,
    thumbUrl: row.thumb_key ? `/api/media/${row.thumb_key}` : null,
    caption: row.caption,
    hashtags: parseHashtags(row.hashtags),
    soundName: row.sound_name,
    status: row.status,
    user: {
      id: owner?.id ?? row.user_id,
      username: owner?.username ?? "unknown",
      name: owner?.name ?? "Unknown",
      avatarUrl: avatarUrl(owner?.username ?? "unknown"),
      verified: owner?.is_admin === 1,
    },
    likes,
    comments,
    saves,
    views: row.views,
    createdAt: toISO(row.created_at),
  };

  if (viewerId) {
    const [liked, saved, following] = await Promise.all([
      exists(
        env,
        "SELECT 1 AS x FROM likes WHERE user_id = ? AND video_id = ?",
        viewerId,
        row.id
      ),
      exists(
        env,
        "SELECT 1 AS x FROM saves WHERE user_id = ? AND video_id = ?",
        viewerId,
        row.id
      ),
      exists(
        env,
        "SELECT 1 AS x FROM follows WHERE follower_id = ? AND followee_id = ?",
        viewerId,
        row.user_id
      ),
    ]);
    shape.me = { liked, saved, following };
  }

  return shape;
}

export async function mapVideos(
  env: Env,
  rows: VideoRow[],
  viewerId?: number | null
): Promise<VideoShape[]> {
  return Promise.all(rows.map((r) => mapVideo(env, r, viewerId)));
}

// ---------------------------------------------------------------------------
// Comment queries + mapping
// ---------------------------------------------------------------------------

export async function getCommentRow(env: Env, id: number): Promise<CommentRow | null> {
  return env.DB.prepare("SELECT * FROM comments WHERE id = ?")
    .bind(id)
    .first<CommentRow>();
}

async function mapComment(
  env: Env,
  row: CommentRow,
  viewerId?: number | null
): Promise<CommentShape> {
  const user = await getUserById(env, row.user_id);
  const likes = await count(
    env,
    "SELECT COUNT(*) AS c FROM comment_likes WHERE comment_id = ?",
    row.id
  );
  const shape: CommentShape = {
    id: row.id,
    videoId: row.video_id,
    parentId: row.parent_id,
    text: row.text,
    likes,
    createdAt: toISO(row.created_at),
    user: {
      id: user?.id ?? row.user_id,
      username: user?.username ?? "unknown",
      name: user?.name ?? "Unknown",
      avatarUrl: avatarUrl(user?.username ?? "unknown"),
    },
  };
  if (viewerId) {
    shape.me = {
      liked: await exists(
        env,
        "SELECT 1 AS x FROM comment_likes WHERE user_id = ? AND comment_id = ?",
        viewerId,
        row.id
      ),
    };
  }
  return shape;
}

/** Top-level comments for a video with one level of nested replies, oldest first. */
export async function getCommentTree(
  env: Env,
  videoId: number,
  viewerId?: number | null
): Promise<CommentShape[]> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM comments WHERE video_id = ? AND status = 'live' ORDER BY created_at ASC, id ASC"
  )
    .bind(videoId)
    .all<CommentRow>();

  const rows = results ?? [];
  const shaped = await Promise.all(rows.map((r) => mapComment(env, r, viewerId)));

  const byId = new Map<number, CommentShape>();
  const roots: CommentShape[] = [];
  for (const c of shaped) byId.set(c.id, c);
  for (const c of shaped) {
    if (c.parentId && byId.has(c.parentId)) {
      const parent = byId.get(c.parentId)!;
      (parent.replies ??= []).push(c);
    } else {
      roots.push(c);
    }
  }
  return roots;
}

export async function mapSingleComment(
  env: Env,
  row: CommentRow,
  viewerId?: number | null
): Promise<CommentShape> {
  return mapComment(env, row, viewerId);
}

// ---------------------------------------------------------------------------
// Notification mapping
// ---------------------------------------------------------------------------

interface NotificationRow {
  id: number;
  user_id: number;
  type: string;
  actor_id: number | null;
  video_id: number | null;
  comment_id: number | null;
  read: number;
  created_at: string;
}

function notificationText(type: string, videoStatus?: string): string {
  switch (type) {
    case "like":
      return "liked your video";
    case "comment":
      return "commented on your video";
    case "follow":
      return "started following you";
    case "mention":
      return "mentioned you in a comment";
    case "moderation":
      if (videoStatus === "live") return "Your video passed review and is now live.";
      return "Your video was removed for violating community guidelines.";
    default:
      return "";
  }
}

export async function getNotifications(
  env: Env,
  userId: number
): Promise<{ notifications: NotificationShape[]; unread: number }> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50"
  )
    .bind(userId)
    .all<NotificationRow>();

  const rows = results ?? [];
  const notifications = await Promise.all(
    rows.map(async (r): Promise<NotificationShape> => {
      let actor: NotificationShape["actor"];
      if (r.actor_id) {
        const a = await getUserById(env, r.actor_id);
        if (a)
          actor = { username: a.username, name: a.name, avatarUrl: avatarUrl(a.username) };
      }
      let videoStatus: string | undefined;
      if (r.type === "moderation" && r.video_id) {
        const v = await getVideoRow(env, r.video_id);
        videoStatus = v?.status;
      }
      const shape: NotificationShape = {
        id: r.id,
        type: r.type,
        read: r.read === 1,
        createdAt: toISO(r.created_at),
        text: notificationText(r.type, videoStatus),
      };
      if (actor) shape.actor = actor;
      if (r.video_id) shape.videoId = r.video_id;
      return shape;
    })
  );

  const unread = await count(
    env,
    "SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read = 0",
    userId
  );

  return { notifications, unread };
}
