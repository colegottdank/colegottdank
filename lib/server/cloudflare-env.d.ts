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
  }
}

export {};
