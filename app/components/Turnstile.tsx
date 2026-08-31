"use client";

import { useEffect, useRef } from "react";

/** Public site key, baked at build time. Empty -> widget not rendered, server skips the check. */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
    __turnstileLoading?: Promise<void>;
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!window.__turnstileLoading) {
    window.__turnstileLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = SCRIPT_SRC;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("turnstile script failed"));
      document.head.appendChild(s);
    });
  }
  return window.__turnstileLoading;
}

/**
 * Cloudflare Turnstile widget. Calls onToken with a fresh token (or null when
 * it expires / errors). `resetKey` changes force a re-challenge.
 */
export function Turnstile({ onToken, resetKey = 0 }: { onToken: (t: string | null) => void; resetKey?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const idRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !ref.current) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        idRef.current = window.turnstile.render(ref.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: "dark",
          size: "flexible",
          callback: (t: string) => onTokenRef.current(t),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (idRef.current && window.turnstile) {
        try { window.turnstile.remove(idRef.current); } catch { /* already gone */ }
      }
      idRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetKey && idRef.current && window.turnstile) {
      try { window.turnstile.reset(idRef.current); } catch { /* ignore */ }
      onTokenRef.current(null);
    }
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={ref} className="min-h-[65px]" />;
}
