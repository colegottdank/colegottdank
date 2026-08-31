import type { Env } from "./context";

/**
 * Cloudflare Turnstile server-side check. Enforced only when TURNSTILE_SECRET
 * is configured (so the site keeps working before the widget exists); fails
 * closed once it is.
 */
export async function verifyTurnstile(
  env: Env,
  token: unknown,
  ip: string | null
): Promise<{ ok: boolean; reason?: string }> {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) {
    console.warn("TURNSTILE_SECRET not set; skipping bot check");
    return { ok: true };
  }
  if (typeof token !== "string" || !token || token.length > 2048) {
    return { ok: false, reason: "Bot check missing" };
  }
  try {
    const form = new URLSearchParams({ secret, response: token });
    if (ip) form.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (data.success === true) return { ok: true };
    console.warn("turnstile rejected:", data["error-codes"]);
    return { ok: false, reason: "Bot check failed" };
  } catch (err) {
    console.error("turnstile siteverify error:", err);
    return { ok: false, reason: "Bot check unavailable" };
  }
}
