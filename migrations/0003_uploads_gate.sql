-- Invite-only uploads + site-wide daily budget counters (spend ceiling).

ALTER TABLE users ADD COLUMN can_upload INTEGER NOT NULL DEFAULT 0;

-- Grandfather: admins and anyone who already has a live video (the seeded creators).
UPDATE users SET can_upload = 1
WHERE is_admin = 1 OR id IN (SELECT DISTINCT user_id FROM videos WHERE status = 'live');

CREATE TABLE daily_counters (
  day TEXT NOT NULL,
  name TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, name)
);
