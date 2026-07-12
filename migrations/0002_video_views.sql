-- Per-impression view log for the scored For You feed. One row per view event
-- (the videos.views counter stays as the aggregate). user_id is nullable for
-- anonymous viewers.

CREATE TABLE video_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL REFERENCES videos(id),
  user_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_video_views_user_video ON video_views(user_id, video_id);
CREATE INDEX idx_video_views_video ON video_views(video_id);
