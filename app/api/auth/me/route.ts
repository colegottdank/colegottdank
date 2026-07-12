import { getCtx, json } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { mapUser } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { env } = await getCtx();
  const row = await getSessionUser(env);
  if (!row) return json({ user: null });
  const user = await mapUser(env, row, row.id);
  return json({ user });
}
