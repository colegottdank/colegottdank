import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const { env } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);

  await env.DB.prepare(
    "UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0"
  )
    .bind(user.id)
    .run();

  return json({ ok: true });
}
