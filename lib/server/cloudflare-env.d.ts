/// <reference types="@cloudflare/workers-types" />

// Extend the CloudflareEnv interface (declared globally by @opennextjs/cloudflare)
// with this project's bindings. Declaration merging keeps the open-next defaults.
declare global {
  interface CloudflareEnv {
    DB: D1Database;
    MEDIA: R2Bucket;
    AI: Ai;
    SESSION_SECRET: string;
    ADMIN_USERNAME: string;
    /** Per-IP limiter for login + signup (10 per 60s, separate buckets). */
    AUTH_RL?: RateLimit;
    /** Per-IP, per-action limiter for comments/reports/follows/uploads (60 per 60s each). */
    WRITE_RL?: RateLimit;
    /** Per-IP+video limiter for view counting (3 per 10s). */
    VIEW_RL?: RateLimit;
  }
}

export {};
