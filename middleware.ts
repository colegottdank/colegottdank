import { NextResponse, type NextRequest } from "next/server";

/**
 * CSRF defense-in-depth for the API: state-changing requests must come from
 * this origin. The session cookie is SameSite=Lax, which already blocks
 * cross-site POSTs in modern browsers; this closes the rest (older browsers,
 * same-site subdomain tricks) by checking Origin / Sec-Fetch-Site.
 *
 * `middleware.ts` (not `proxy.ts`): OpenNext on Workers only supports the Edge
 * runtime, and Next 16 pins proxy.ts to Node.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function middleware(request: NextRequest) {
  // Compare against `host` only. `x-forwarded-host` is client-controlled here
  // (OpenNext overwrites it with `host` after middleware, so handlers are safe).
  if (SAFE_METHODS.has(request.method)) return NextResponse.next();

  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site") {
    return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
  }

  const origin = request.headers.get("origin");
  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return NextResponse.json({ error: "Invalid Origin" }, { status: 403 });
    }
    const host = request.headers.get("host") ?? "";
    if (originHost !== host) {
      return NextResponse.json({ error: "Cross-site request blocked" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
