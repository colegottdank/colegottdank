import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Only wire up local Cloudflare bindings for `next dev`; `next build` does not
// need them and would otherwise try to open a remote session.
if (process.env.NODE_ENV === "development") initOpenNextCloudflareForDev();

const isDev = process.env.NODE_ENV === "development";

// 'unsafe-inline' for scripts is required by Next's inline RSC/hydration
// payloads without a nonce pipeline; everything else is locked to self.
// Dev only: React's dev build needs eval, and LAN-IP testing can't upgrade to https.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
  "frame-src https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://api.dicebear.com",
  "media-src 'self' blob: https://github.com https://*.githubusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    // Everything except served media: next.config headers override handler
    // headers under OpenNext, and /api/media sets its own (stricter) CSP.
    return [{ source: "/((?!api/media/).*)", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
