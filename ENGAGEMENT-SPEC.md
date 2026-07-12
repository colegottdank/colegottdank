# Engagement Spec: Making the TikTok Real

Goal: real accounts on colegottdank.com. People sign up, upload videos, curate a feed, like, comment, reply, follow, share. Everything below is grounded in an audit of the current UI (2026-07-11).

## Current state

The TikTok UI is complete but 100% fake. No API routes, no auth, no server data. Persistence is two localStorage keys. "Post video" shows a success toast and uploads nothing. "Save profile" never saves. The current user is the magic string `"currentuser"`. Videos are static MP4s on GitHub Releases, avatars from dicebear.

Good news: every surface we need already has finished UI. The work is a backend plus rewiring, not new screens.

## Engagement surfaces

Every place a user acts. **Write** = creates data others see (needs content filtering). Tiers: 1 = MVP, 2 = fast follow, 3 = later.

### Identity

| Surface | Action | Write? | Current state | Tier |
|---|---|---|---|---|
| Sign up / log in | create account, session | yes (username, name) | doesn't exist | 1 |
| Edit profile | name, username, bio | yes | UI exists, Save is a no-op | 1 |
| Avatar upload | change photo | yes (image) | button has no handler | 2 |
| Private account toggle | visibility | no | dead toggle in EditProfile; working one in PrivacySettings (LS only) | 2 |

### Video

| Surface | Action | Write? | Current state | Tier |
|---|---|---|---|---|
| Upload + post | file → caption → visibility → post | yes (video, caption, hashtags, sound name) | full compose UI, Post is a toast | 1 |
| Delete own video | remove from feed | no | doesn't exist, needs UI | 1 |
| Drafts | save/load/delete | no (private) | local array, lost on reload | 3 |
| Record in-browser | camera capture | yes | "coming soon" toast | 3 |
| Schedule post | delayed publish | yes | fake confirm | 3 |
| View counts | watch = view++ | no | static numbers | 2 |
| Allow comments/duet/stitch toggles | per-video settings | no | toggles exist, never read | 2 (comments toggle) / 3 (duet, stitch) |

### Reactions & comments

| Surface | Action | Write? | Current state | Tier |
|---|---|---|---|---|
| Like video | heart, `L`, double-tap | no (but visible count) | LS only, cosmetic +1 | 1 |
| Save/bookmark | bookmark, `S` | no (private) | LS only | 1 |
| Comment | post text | yes | LS only, flat | 1 |
| Reply | threaded reply | yes | fake — `@user` prefix, no nesting; needs `parentId` | 1 |
| Like comment | heart on comment | no | LS only | 1 |
| Delete own comment | remove | no | doesn't exist, needs UI | 1 |

### Social graph

| Surface | Action | Write? | Current state | Tier |
|---|---|---|---|---|
| Follow/unfollow | feed badge + profile button | no | LS only | 1 |
| Following feed | tab shows followed users' videos | no | hardcoded second array | 1 |
| Followers/following lists | tap counts on profile | no | counts are static, lists don't exist | 2 |

### Profiles & discovery

| Surface | Action | Write? | Current state | Tier |
|---|---|---|---|---|
| View any profile | videos / liked tabs | no | hardcoded map; unknown users render blank | 1 |
| Tap video thumbnail → play | from profile/search/hashtag grids | no | no-op everywhere | 1 |
| Search | users, captions, hashtags | no | filters hardcoded array | 2 |
| Hashtag pages | videos by tag | no | filters hardcoded array | 2 |
| Sound pages | videos by sound | no | filters hardcoded array | 3 |
| Share | real URLs | no | shares fake tiktok.com links — needs `/@user/video/[id]` routes | 1 |

### Inbox

| Surface | Action | Write? | Current state | Tier |
|---|---|---|---|---|
| Notifications | like/comment/follow/mention events | no (system-generated) | hardcoded seed, nothing generates them | 2 |
| Mark read | persist read state | no | local only | 2 |
| DMs | send/receive messages | yes | fake local append | 3 (or never — biggest abuse surface, least value) |

### Safety (required before strangers can post)

| Surface | Action | Write? | Current state | Tier |
|---|---|---|---|---|
| Report video/user/comment | submit report | no (internal) | console.log; video long-press report is a "coming soon" toast | 1 |
| Block user | hide their content both ways | no | toast only; blocked list is hardcoded | 2 |
| Mute user | hide their content one way | no | toast only | 3 |
| Privacy settings | private account, liked-videos visibility, downloads | no | persists to own LS key, enforced nowhere | 2 |
| Admin: takedown + ban | Cole removes content/users | no | doesn't exist | 1 |

## Content filtering

Every write from the tables above passes moderation before it's visible. Cheap model, per Cole: Workers AI `@cf/meta/llama-guard-3-8b` runs on-platform for fractions of a cent per check; Haiku 4.5 as fallback for ambiguous cases. Filtering is a pipeline stage, not a suggestion — content lands as `pending` and flips to `live` on pass.

| Content | Check | When |
|---|---|---|
| Username, display name, bio | Llama Guard text check + slur/impersonation list | sync, on save |
| Caption + hashtags | Llama Guard text check | sync, on post |
| Comment / reply | Llama Guard text check | sync, on post (<300ms, acceptable) |
| Video | extract 3–5 frames → vision moderation (Workers AI llava or Haiku vision) + duration/size caps | async — video `pending` until pass, only uploader sees it meanwhile |
| Avatar image | vision moderation | async |
| Sound name | text check | sync |

Non-model layers (do these regardless):
- **Turnstile** on signup and upload — kills drive-by bots for free.
- **Rate limits**: N comments/min, N uploads/day, N signups/IP/day.
- **File constraints**: MP4/WebM only, ≤100MB, ≤3min, validated server-side.
- **Report threshold**: X reports auto-hides content pending review.
- **Kill switch**: env flag that freezes all writes site-wide.

## Backend shape (Cloudflare-native, already deployed there)

- **D1** — users, videos, comments, likes, follows, reports, notifications. This scale never outgrows it.
- **R2 + Cloudflare Stream** — Stream for video (handles transcode, HLS, thumbnails; ~$5/1k min stored). R2 alone is cheaper if we accept raw MP4 playback like today. Start R2, move to Stream if quality/format pain shows up.
- **Workers AI** — moderation (above).
- **Auth** — roll simple: email magic link or OAuth (GitHub/Google) + signed session cookie. No password storage. A magic string `"currentuser"` becomes a real `users` row.
- **API routes** in the existing Next.js app (`app/api/*`), no separate service.

Data model changes from today's `lib/data.ts`: add `User` (real identity, replaces 3 conflicting hardcoded username maps), add `parentId` to Comment, make all counts computed not static, add `status: pending|live|removed` to every UGC entity.

## Mobile: TikTok-first

Confirmed bug: `app/page.tsx:1150` wraps the entire phone UI in `hidden lg:flex` — below the `lg` breakpoint the TikTok doesn't render at all, mobile visitors only get the bio.

Required behavior:
- **Phone**: full-screen TikTok feed by default (no phone-frame chrome, the viewport IS the phone).
- **Bio/profile access from mobile**: simplest option that fits the metaphor — Cole's profile is the "Me" of the site; put the bio behind the profile surface or a persistent top-corner link. Exact treatment is Sketch's call (design agent), not spec'd here.
- **Desktop**: unchanged (bio + phone frame side by side).

## Build order

1. **Foundation**: auth + D1 schema + migrate hardcoded data → seed rows. Mobile TikTok-first fix ships here too (independent, do it first — it's CSS).
2. **Tier 1 reads/reactions**: real feed from D1, likes, saves, follows, real share URLs, thumbnail→player navigation.
3. **Tier 1 writes + filtering**: comments/replies with moderation pipeline, then video upload with the async video pipeline, report flow, admin takedown.
4. **Tier 2**: notifications, search over real data, view counts, block enforcement, privacy enforcement, avatar upload.
5. **Tier 3 / judgment calls**: DMs (recommend skipping), drafts, sounds, duet/stitch, scheduling.

Rule of thumb: nothing accepts stranger writes until the filtering pipeline and admin takedown exist. Likes/follows first (no content risk), comments second (text-only risk), video last (highest risk, async pipeline).
