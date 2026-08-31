import { getCtx, json, jsonError } from "@/lib/server/context";
import { getSessionUser } from "@/lib/server/auth";
import { getNotifications } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { env } = await getCtx();
  const user = await getSessionUser(env);
  if (!user) return jsonError("Authentication required", 401);
  const { notifications, unread } = await getNotifications(env, user.id);
  return json({ notifications, unread });
}
