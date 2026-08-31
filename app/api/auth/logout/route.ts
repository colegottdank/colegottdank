import { getCtx, json } from "@/lib/server/context";
import { destroySession } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const { env } = await getCtx();
  await destroySession(env);
  return json({ ok: true });
}
