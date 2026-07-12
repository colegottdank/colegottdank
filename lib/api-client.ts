// Typed fetch wrappers for the colegottdank.com API.
// Contract: API-CONTRACT.md. Same-origin, cookie session (httpOnly) sent automatically.

/* ---------- Shared shapes (mirror API-CONTRACT.md) ---------- */

export interface User {
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

export type VideoStatus = "pending" | "live" | "rejected" | "removed";

export interface VideoAuthor {
  id: number;
  username: string;
  name: string;
  avatarUrl: string;
  verified: boolean;
}

export interface Video {
  id: number;
  url: string;
  thumbUrl: string | null;
  caption: string;
  hashtags: string[];
  soundName: string;
  status: VideoStatus;
  user: VideoAuthor;
  likes: number;
  comments: number;
  saves: number;
  views: number;
  createdAt: string;
  me?: { liked: boolean; saved: boolean; following: boolean };
}

export interface Comment {
  id: number;
  videoId: number;
  parentId: number | null;
  text: string;
  likes: number;
  createdAt: string;
  user: { id: number; username: string; name: string; avatarUrl: string };
  me?: { liked: boolean };
  replies?: Comment[];
}

export type NotificationType = "like" | "comment" | "follow" | "mention" | "moderation";

export interface Notification {
  id: number;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  actor?: { username: string; name: string; avatarUrl: string };
  videoId?: number;
  text: string;
}

export type ProfileTab = "videos" | "liked" | "saved";
export type FeedTab = "foryou" | "following";
export type ReportTargetType = "video" | "comment" | "user";
export type DiscoverSort = "top" | "recent";

export interface TrendingHashtag {
  tag: string;
  videos: number;
  views: number;
}

export interface TrendingSound {
  name: string;
  videos: number;
  views: number;
}

/* ---------- Error type ---------- */

export class ApiError extends Error {
  status: number;
  /** Moderation reason on 422, when the server provides one. */
  reason?: string;
  constructor(status: number, message: string, reason?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.reason = reason;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });

  let body: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const b = (body || {}) as { error?: string; reason?: string };
    throw new ApiError(res.status, b.error || res.statusText || "Request failed", b.reason);
  }
  return body as T;
}

const json = (data: unknown): RequestInit => ({ body: JSON.stringify(data) });

/* ---------- Auth ---------- */

export const auth = {
  signup: (input: { username: string; name: string; password: string }) =>
    request<{ user: User }>("/api/auth/signup", { method: "POST", ...json(input) }),
  login: (input: { username: string; password: string }) =>
    request<{ user: User }>("/api/auth/login", { method: "POST", ...json(input) }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: User | null }>("/api/auth/me"),
};

/* ---------- Feed & videos ---------- */

export const feed = {
  get: (input: { tab: FeedTab; cursor?: number | null; limit?: number }) => {
    const params = new URLSearchParams({ tab: input.tab });
    if (input.cursor != null) params.set("cursor", String(input.cursor));
    if (input.limit != null) params.set("limit", String(input.limit));
    return request<{ videos: Video[]; nextCursor: number | null }>(`/api/feed?${params.toString()}`);
  },
};

export const videos = {
  get: (id: number) => request<{ video: Video }>(`/api/videos/${id}`),
  delete: (id: number) => request<{ ok: true }>(`/api/videos/${id}`, { method: "DELETE" }),
  view: (id: number) =>
    request<{ ok: true }>(`/api/videos/${id}/view`, { method: "POST" }).catch(() => ({ ok: true as const })),
  like: (id: number) => request<{ likes: number }>(`/api/videos/${id}/like`, { method: "POST" }),
  unlike: (id: number) => request<{ likes: number }>(`/api/videos/${id}/like`, { method: "DELETE" }),
  save: (id: number) => request<{ saves: number }>(`/api/videos/${id}/save`, { method: "POST" }),
  unsave: (id: number) => request<{ saves: number }>(`/api/videos/${id}/save`, { method: "DELETE" }),

  /**
   * Multipart upload with real progress via XMLHttpRequest.
   * Resolves with the created (pending) video, or rejects with ApiError (incl. 422 moderation reason).
   */
  create: (
    form: FormData,
    onProgress?: (pct: number) => void,
  ): Promise<{ video: Video }> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/videos");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        let body: { error?: string; reason?: string; video?: Video } = {};
        try {
          body = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch {
          body = {};
        }
        if (xhr.status >= 200 && xhr.status < 300 && body.video) {
          resolve({ video: body.video });
        } else {
          reject(new ApiError(xhr.status, body.error || "Upload failed", body.reason));
        }
      };
      xhr.onerror = () => reject(new ApiError(0, "Network error during upload"));
      xhr.send(form);
    }),
};

/* ---------- Comments ---------- */

export const comments = {
  list: (videoId: number) => request<{ comments: Comment[] }>(`/api/videos/${videoId}/comments`),
  post: (videoId: number, input: { text: string; parentId?: number }) =>
    request<{ comment: Comment }>(`/api/videos/${videoId}/comments`, { method: "POST", ...json(input) }),
  delete: (id: number) => request<{ ok: true }>(`/api/comments/${id}`, { method: "DELETE" }),
  like: (id: number) => request<{ likes: number }>(`/api/comments/${id}/like`, { method: "POST" }),
  unlike: (id: number) => request<{ likes: number }>(`/api/comments/${id}/like`, { method: "DELETE" }),
};

/* ---------- Social / users ---------- */

export const users = {
  get: (username: string) => request<{ user: User }>(`/api/users/${encodeURIComponent(username)}`),
  videos: (username: string, tab: ProfileTab) =>
    request<{ videos: Video[] }>(`/api/users/${encodeURIComponent(username)}/videos?tab=${tab}`),
  follow: (username: string) =>
    request<{ followers: number }>(`/api/users/${encodeURIComponent(username)}/follow`, { method: "POST" }),
  unfollow: (username: string) =>
    request<{ followers: number }>(`/api/users/${encodeURIComponent(username)}/follow`, { method: "DELETE" }),
  updateMe: (input: { name?: string; bio?: string }) =>
    request<{ user: User }>("/api/users/me", { method: "PATCH", ...json(input) }),
};

/* ---------- Inbox ---------- */

export const notifications = {
  list: () => request<{ notifications: Notification[]; unread: number }>("/api/notifications"),
  markRead: () => request<{ ok: true }>("/api/notifications/read", { method: "POST" }),
};

/* ---------- Safety ---------- */

export const reports = {
  submit: (input: {
    targetType: ReportTargetType;
    targetId: number | string;
    reason: string;
    details?: string;
  }) => request<{ ok: true }>("/api/reports", { method: "POST", ...json(input) }),
};

/* ---------- Discovery (search, trending, hashtag/sound listings) ---------- */

export const discover = {
  /** Full-text search. Empty q → 400. */
  search: (q: string) =>
    request<{ videos: Video[]; users: User[] }>(`/api/search?q=${encodeURIComponent(q)}`),
  trendingHashtags: () =>
    request<{ hashtags: TrendingHashtag[] }>("/api/trending/hashtags"),
  trendingSounds: () =>
    request<{ sounds: TrendingSound[] }>("/api/trending/sounds"),
  /** `tag` is passed with or without a leading '#'; the '#' is stripped. */
  hashtagVideos: (tag: string, sort: DiscoverSort = "top") =>
    request<{ videos: Video[] }>(`/api/hashtags/${encodeURIComponent(tag.replace(/^#/, ""))}/videos?sort=${sort}`),
  /** Sounds are identified by name (contains spaces/slashes → query param). */
  soundVideos: (name: string, sort: DiscoverSort = "top") =>
    request<{ videos: Video[] }>(`/api/sounds/videos?name=${encodeURIComponent(name)}&sort=${sort}`),
};

/* ---------- Helpers ---------- */

/** Canonical share URL for a video. Unfurls with the video's thumbnail. */
export const shareUrl = (id: number) => `https://colegottdank.com/v/${id}`;

export const api = { auth, feed, videos, comments, users, notifications, reports, discover };
export default api;
