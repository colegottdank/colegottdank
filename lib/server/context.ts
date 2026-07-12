import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export type Env = CloudflareEnv;

/** Get the Cloudflare bindings + execution context inside a route handler. */
export async function getCtx(): Promise<{
  env: Env;
  ctx: ExecutionContext;
}> {
  const { env, ctx } = await getCloudflareContext({ async: true });
  return { env: env as Env, ctx: ctx as ExecutionContext };
}

/** JSON success response. */
export function json<T>(data: T, init?: number | ResponseInit): NextResponse {
  const responseInit = typeof init === "number" ? { status: init } : init;
  return NextResponse.json(data as Record<string, unknown>, responseInit);
}

/** JSON error response: `{ error }` plus any extra fields (e.g. `reason`). */
export function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>
): NextResponse {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}
