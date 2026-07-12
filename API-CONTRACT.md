# API Contract

Shared contract between backend (`app/api/*`, `lib/server/*`) and frontend (`lib/api-client.ts`). Both sides build against this. JSON in/out unless noted. Errors: `{ "error": string }` with 4xx/5xx.

## Conventions

- Auth: `session` cookie (httpOnly, Secure, SameSite=Lax, 30d). Token is random 32 bytes hex; DB stores SHA-256 hash in `sessions.token_hash`.
- Passwords: PBKDF2-SHA256 via Web Crypto, 100k iterations, per-user salt. Stored in `users.password_hash`/`password_salt`.
- `me` in responses = viewer-specific fields. Anonymous users can read everything public; any write requires auth (401).
- All timestamps ISO 8601 UTC. Frontend renders relative ("2h").
- Cloudflare env via `getCloudflareContext()` from `@opennextjs/cloudflare` (bindings: `DB` D1, `MEDIA` R2, `AI` Workers AI, vars `ADMIN_USERNAME`, secret `SESSION_SECRET`).

## Shapes

```ts
User = { id: number, username: string, name: string, bio: string, avatarUrl: string, verified: boolean, isAdmin: boolean,
         followers: number, following: number, likes: number, videos: number,
         me?: { following: boolean } }
Video = { id: number, url: string, thumbUrl: string | null, caption: string, hashtags: string[],
          soundName: string, status: 'pending'|'live'|'rejected'|'removed',
          user: { id, username, name, avatarUrl, verified },
          likes: number, comments: number, saves: number, views: number, createdAt: string,
          me?: { liked: boolean, saved: boolean, following: boolean } }
Comment = { id: number, videoId: number, parentId: number | null, text: string, likes: number, createdAt: string,
            user: { id, username, name, avatarUrl }, me?: { liked: boolean }, replies?: Comment[] }
Notification = { id: number, type: 'like'|'comment'|'follow'|'mention'|'moderation', read: boolean, createdAt: string,
                 actor?: { username, name, avatarUrl }, videoId?: number, text: string }
```

`avatarUrl`: dicebear URL seeded by username (no avatar upload in v1).

## Endpoints

### Auth
- `POST /api/auth/signup` `{ username, name, password }` → `{ user }` + sets cookie. Username: `^[a-z0-9_.]{3,24}$`, unique (case-insensitive). Password ≥ 8 chars. Username+name pass text moderation. First user whose username == ADMIN_USERNAME gets `is_admin=1`.
- `POST /api/auth/login` `{ username, password }` → `{ user }` + cookie. 401 on bad creds, 403 if banned.
- `POST /api/auth/logout` → `{ ok: true }`, deletes session.
- `GET /api/auth/me` → `{ user }` or `{ user: null }` (200 both ways).

### Feed & videos
- `GET /api/feed?tab=foryou|following&cursor=<id>&limit=10` → `{ videos: Video[], nextCursor: number | null }`. foryou = all live public, newest first (cursor = id descending). following (auth) = only followed users. Viewer's own pending/rejected videos included in their profile listing only, never in feed.
- `GET /api/videos/:id` → `{ video }`. 404 unless live, owner, or admin.
- `POST /api/videos` — multipart form: `file` (video/mp4|webm, ≤100MB), `thumb` (image/jpeg, optional, client-extracted first frame), `caption` (≤300 chars), `hashtags`, `visibility`, `allowComments`. → `{ video }` with `status: 'pending'`. Flow: caption moderated sync (reject = 422 with reason), file stored to R2 `videos/{userId}/{uuid}.mp4`, thumb to `thumbs/...`, row inserted pending; `waitUntil` runs thumb vision moderation → status flips live/rejected + notification to owner. No thumb provided → moderate caption only, then live.
- `DELETE /api/videos/:id` — owner or admin → `{ ok }` (status='removed', R2 object deleted).
- `POST /api/videos/:id/view` → `{ ok }` (views++, no auth needed, best-effort). Also logs a `video_views` row (viewer id, or NULL if anonymous) that feeds the scored For You ranking.
- `GET /api/media/:key+` — streams R2 object with Range support (video seeking) + Cache-Control. Keys are the r2_key stored on the video; only serve keys prefixed `videos/` or `thumbs/`.

### Reactions
- `POST /api/videos/:id/like` / `DELETE ...` → `{ likes: number }` (idempotent). Like creates notification for owner.
- `POST /api/videos/:id/save` / `DELETE ...` → `{ saves: number }`.
- `GET /api/users/:username/videos?tab=videos|liked|saved` → `{ videos }`. liked respects privacy later; saved = self only.

### Comments
- `GET /api/videos/:id/comments` → `{ comments: Comment[] }` — top-level with nested `replies` (one level), oldest first, live only.
- `POST /api/videos/:id/comments` `{ text (≤500), parentId? }` → `{ comment }`. Text moderated sync; reject = 422 `{ error, reason }`. 403 if video has allow_comments=0. Notifies video owner (and parent commenter on reply).
- `DELETE /api/comments/:id` — author, video owner, or admin → `{ ok }`.
- `POST /api/comments/:id/like` / `DELETE` → `{ likes }`.

### Social
- `POST /api/users/:username/follow` / `DELETE` → `{ followers }`. Notifies followee.
- `GET /api/users/:username` → `{ user }` (404 unknown).
- `PATCH /api/users/me` `{ name?, bio? }` → `{ user }`. Moderated sync. (Username changes: not in v1.)

### Inbox
- `GET /api/notifications` → `{ notifications, unread: number }` (latest 50).
- `POST /api/notifications/read` → `{ ok }` (mark all read).

### Safety & admin
- `POST /api/reports` `{ targetType: 'video'|'comment'|'user', targetId, reason, details? }` → `{ ok }`. 3+ open reports on a video/comment auto-sets it pending (hidden) for admin review.
- `GET /api/admin/queue` (admin) → `{ reports, pendingVideos }`.
- `POST /api/admin/moderate` (admin) `{ targetType, targetId, action: 'approve'|'remove'|'ban' }` → `{ ok }`.

### Moderation internals (lib/server/moderation.ts)
- `moderateText(env, text)` → `{ ok: boolean, reason?: string }` using `env.AI.run('@cf/meta/llama-guard-3-8b', ...)` with the model's chat format; fail-open on AI errors (log, allow) so an AI outage doesn't brick the site — EXCEPT video thumbs which fail-closed to pending.
- `moderateImage(env, bytes)` → same shape, via `@cf/llava-hf/llava-1.5-7b-hf` prompt asking for unsafe-content classification, parsed conservatively.
- Rate limits (per user, in D1 or memory-best-effort): 5 uploads/day, 20 comments/min → 429.

## Discovery (addendum, 2026-07-11)

All discovery reads are public (no auth). Only live+public videos are ever counted or returned.

- `GET /api/search?q=<text>` → `{ videos: Video[], users: User[] }`. Videos: caption or hashtags LIKE match. Users: username/name LIKE match. Limit 30 each. Empty q → 400.
- `GET /api/trending/hashtags` → `{ hashtags: [{ tag: string, videos: number, views: number }] }` — aggregated from live videos' hashtags column, ordered by total views desc, top 10.
- `GET /api/trending/sounds` → `{ sounds: [{ name: string, videos: number, views: number }] }` — GROUP BY sound_name, same ordering, top 10.
- `GET /api/hashtags/:tag/videos?sort=top|recent` → `{ videos }`. tag WITHOUT the # (URL-encoded). top = views desc, recent = created_at desc. Limit 30.
- `GET /api/sounds/videos?name=<sound_name>&sort=top|recent` → `{ videos }` — exact sound_name match (query param because names contain spaces/slashes).

Hashtag matching against the space-separated `hashtags` column must match whole tags (e.g. `' ' || hashtags || ' ' LIKE '% #tag %'`), not substrings.

## Frontend notes

- `lib/api-client.ts`: typed thin fetch wrappers for all of the above, no framework.
- localStorage stays ONLY for device prefs (mute state, privacy modal); all social data moves to API. Remove seeds usage; `lib/data.ts` types can be adapted/reused.
- Anonymous visitors: can scroll feed, view comments/profiles. Any engagement tap (like/comment/follow/save/upload) opens the auth modal.
- After signup/login, `GET /api/auth/me` hydrates a `useAuth` context.
- Upload: extract first frame client-side via canvas → send as `thumb`. Show the pending state ("Your video is being reviewed") on own profile.
- Mobile (<lg): render the TikTok full-viewport (no phone frame). Cole's bio moves behind an "About Cole" entry point (button/link in top bar or a profile route). Desktop ≥lg unchanged.

## Feed ranking (2026-07-11)

`tab=foryou` is a scored ranking, not chronological. `tab=following` stays chronological (id cursor descending), unchanged.

Candidate pool: latest 500 live+public videos, excluding the viewer's own when logged in. Each video is scored in JS:

```
base  = 4*likes + 6*comments + 5*saves + log10(views + 1)
score = base / (ageHours + 6)^1.3
score *= 1.5   if the creator is followed (logged-in viewer)
score *= 0.2   if the viewer already viewed it (video_views)
score *= 0.85 + 0.3*random()   // jitter, reshuffles each load
```

`ageHours` comes from `(julianday('now') - julianday(created_at)) * 24`. Videos are sorted by score descending, then sliced `[offset, offset+limit)`.

Cursor semantics differ by tab and never cross-contaminate:
- **foryou**: `cursor` is an opaque OFFSET into the ranked list (0-based). `nextCursor = offset + limit` when a full page returns, else `null`. Because of jitter, pages reshuffle between requests; the offset still advances and terminates at the pool boundary.
- **following**: `cursor` is an opaque video id, descending (unchanged). `nextCursor` = last row's id when the page is full, else `null`.

Frontend treats `cursor`/`nextCursor` as opaque, so no client change is needed. The `?v=<id>` share-link pinning is a frontend concern and uses `GET /api/videos/:id`, not the feed cursor.
