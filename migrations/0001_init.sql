-- Real accounts + UGC for the TikTok. All UGC rows carry a status for the moderation pipeline.

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  avatar_key TEXT,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  is_admin INTEGER NOT NULL DEFAULT 0,
  is_private INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','banned')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

CREATE TABLE videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  r2_key TEXT NOT NULL,
  thumb_key TEXT,
  caption TEXT NOT NULL DEFAULT '',
  hashtags TEXT NOT NULL DEFAULT '',
  sound_name TEXT NOT NULL DEFAULT 'original sound',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','private')),
  allow_comments INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','live','rejected','removed')),
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_videos_feed ON videos(status, created_at DESC);
CREATE INDEX idx_videos_user ON videos(user_id, created_at DESC);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL REFERENCES videos(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  parent_id INTEGER REFERENCES comments(id),
  text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('live','rejected','removed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_comments_video ON comments(video_id, created_at);

CREATE TABLE likes (
  user_id INTEGER NOT NULL REFERENCES users(id),
  video_id INTEGER NOT NULL REFERENCES videos(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, video_id)
);
CREATE INDEX idx_likes_video ON likes(video_id);

CREATE TABLE comment_likes (
  user_id INTEGER NOT NULL REFERENCES users(id),
  comment_id INTEGER NOT NULL REFERENCES comments(id),
  PRIMARY KEY (user_id, comment_id)
);

CREATE TABLE saves (
  user_id INTEGER NOT NULL REFERENCES users(id),
  video_id INTEGER NOT NULL REFERENCES videos(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, video_id)
);

CREATE TABLE follows (
  follower_id INTEGER NOT NULL REFERENCES users(id),
  followee_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (follower_id, followee_id)
);
CREATE INDEX idx_follows_followee ON follows(followee_id);

CREATE TABLE reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK (target_type IN ('video','comment','user')),
  target_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN ('like','comment','follow','mention','moderation')),
  actor_id INTEGER REFERENCES users(id),
  video_id INTEGER REFERENCES videos(id),
  comment_id INTEGER REFERENCES comments(id),
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
