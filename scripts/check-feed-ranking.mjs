import assert from "node:assert/strict";
import { orderPool } from "../lib/server/feed.ts";

function seeded(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function video(id, overrides = {}) {
  return {
    id,
    user_id: (id % 5) + 1,
    r2_key: `videos/${id}.mp4`,
    thumb_key: null,
    caption: `video ${id}`,
    hashtags: "",
    sound_name: "original",
    visibility: "public",
    allow_comments: 1,
    status: "live",
    views: 50 + id,
    created_at: "2026-09-15 00:00:00",
    like_count: 0,
    comment_count: 0,
    save_count: 0,
    age_hours: 2,
    ...overrides,
  };
}

const recent = Array.from({ length: 24 }, (_, index) => video(index + 1));
const viral = Array.from({ length: 6 }, (_, index) =>
  video(100 + index, {
    age_hours: 24 * (index + 3),
    views: 100_000 + index * 10_000,
    like_count: 5_000 - index * 100,
    comment_count: 600 - index * 10,
    save_count: 300 - index * 10,
  })
);
const pool = [...recent, ...viral];
const mood = { archetype: "fresh", temperature: 1 };
const signals = { followed: new Set(), viewed: new Set() };

const first = orderPool(pool, seeded(42), mood, signals);
const second = orderPool(pool, seeded(42), mood, signals);

assert.deepEqual(first.map((row) => row.id), second.map((row) => row.id));
assert.equal(new Set(first.map((row) => row.id)).size, pool.length);
assert.ok(first.slice(0, 3).some((row) => row.id >= 100), "an older viral post should surface near the top");

for (let index = 2; index < first.length; index++) {
  const run = first.slice(index - 2, index + 1);
  assert.ok(new Set(run.map((row) => row.user_id)).size > 1, "creator runs should stay diverse");
}

console.log("feed ranking checks passed");
