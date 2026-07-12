import type { Env } from "./context";

// Workers AI `.run` has heavily overloaded, model-specific typings; use a loose
// call signature so we can pass model-appropriate inputs without fighting them.
type LooseAiRun = (model: string, inputs: unknown) => Promise<unknown>;

export interface ModerationResult {
  ok: boolean;
  reason?: string;
  /** true when the AI call itself failed (used to decide fail-open vs fail-closed). */
  errored?: boolean;
}

// Llama Guard hazard category codes -> human labels.
const LLAMA_GUARD_CATEGORIES: Record<string, string> = {
  S1: "Violent Crimes",
  S2: "Non-Violent Crimes",
  S3: "Sex-Related Crimes",
  S4: "Child Sexual Exploitation",
  S5: "Defamation",
  S6: "Specialized Advice",
  S7: "Privacy",
  S8: "Intellectual Property",
  S9: "Indiscriminate Weapons",
  S10: "Hate",
  S11: "Suicide & Self-Harm",
  S12: "Sexual Content",
  S13: "Elections",
  S14: "Code Interpreter Abuse",
};

/**
 * Text moderation via Llama Guard. Fail-OPEN on AI errors (log + allow) so an
 * AI outage does not brick the site. Empty text is allowed without a call.
 */
export async function moderateText(
  env: Env,
  text: string
): Promise<ModerationResult> {
  const content = (text ?? "").trim();
  if (!content) return { ok: true };

  try {
    const res = await (env.AI.run as unknown as LooseAiRun)(
      "@cf/meta/llama-guard-3-8b",
      { messages: [{ role: "user", content }] }
    );

    const raw = extractText(res).trim().toLowerCase();
    // Llama Guard emits "safe" or "unsafe\nS<n>".
    if (!raw || raw.startsWith("safe")) return { ok: true };
    if (raw.startsWith("unsafe")) {
      const codeMatch = raw.toUpperCase().match(/S\d{1,2}/);
      const reason = codeMatch
        ? LLAMA_GUARD_CATEGORIES[codeMatch[0]] ?? "Unsafe content"
        : "Unsafe content";
      return { ok: false, reason };
    }
    // Unrecognized output -> treat as safe (fail-open).
    return { ok: true };
  } catch (err) {
    console.error("moderateText AI error (failing open):", err);
    return { ok: true, errored: true };
  }
}

/**
 * Image moderation via LLaVA vision. Returns ok/reason plus `errored` on AI
 * failure. Callers decide fail-open vs fail-closed (video thumbs fail-closed).
 */
export async function moderateImage(
  env: Env,
  bytes: Uint8Array
): Promise<ModerationResult> {
  try {
    const res = await (env.AI.run as unknown as LooseAiRun)(
      "@cf/llava-hf/llava-1.5-7b-hf",
      {
        image: Array.from(bytes),
        prompt:
          "You are a strict content-safety classifier. Does this image contain any unsafe content: nudity, sexual content, graphic violence, gore, self-harm, hate symbols, or other illegal content? Answer with exactly one word: SAFE or UNSAFE. If UNSAFE, add a short reason after a colon.",
        max_tokens: 128,
      }
    );

    const raw = extractText(res).trim();
    const lower = raw.toLowerCase();
    if (lower.includes("unsafe")) {
      const idx = raw.indexOf(":");
      const reason = idx >= 0 ? raw.slice(idx + 1).trim() : "Unsafe visual content";
      return { ok: false, reason: reason || "Unsafe visual content" };
    }
    if (lower.includes("safe")) return { ok: true };
    // Ambiguous output -> conservative: treat as not-ok but flag as errored so
    // the caller (fail-closed thumbs) keeps it pending rather than rejecting.
    return { ok: false, errored: true, reason: "Unclassifiable image" };
  } catch (err) {
    console.error("moderateImage AI error:", err);
    return { ok: false, errored: true };
  }
}

/** Pull a text field out of the various Workers AI response shapes. */
function extractText(res: unknown): string {
  if (typeof res === "string") return res;
  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    if (typeof obj.response === "string") return obj.response;
    if (typeof obj.description === "string") return obj.description;
    if (typeof obj.result === "string") return obj.result;
    if (obj.response && typeof obj.response === "object") {
      return JSON.stringify(obj.response);
    }
  }
  return "";
}
