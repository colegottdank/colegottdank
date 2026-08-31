import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { getUserByUsername, mapUser } from "@/lib/server/db";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ username: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { env } = await getCtx();
  const { username } = await params;
  const row = await getUserByUsername(env, username);
  if (!row) return jsonError("Not found", 404);

  const viewer = await getSessionUser(env);
  const user = await mapUser(env, row, viewer?.id ?? null);
  return json({ user });
}
