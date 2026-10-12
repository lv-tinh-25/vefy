import { db, pushSubscriptions } from "@vefy/db";
import { and, eq, inArray } from "drizzle-orm";
import type { PushSubscriptionInput } from "@vefy/shared";
import { sendPush, type PushPayload } from "../lib/push";

export async function subscribe(userId: string, sub: PushSubscriptionInput, userAgent: string | null) {
  // The same browser can be re-subscribed after signing in as someone else; the latest owner wins
  await db
    .insert(pushSubscriptions)
    .values({ userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, userAgent })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId, p256dh: sub.keys.p256dh, auth: sub.keys.auth, userAgent },
    });
}

export async function unsubscribe(userId: string, endpoint: string) {
  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
}

/** Sends to every device of the user (or only `endpoint`); returns how many accepted it */
export async function sendToUser(userId: string, payload: PushPayload, endpoint?: string): Promise<number> {
  const where = endpoint
    ? and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint))
    : eq(pushSubscriptions.userId, userId);
  const subs = await db.select().from(pushSubscriptions).where(where);

  const results = await Promise.all(subs.map(async (sub) => ({ sub, result: await sendPush(sub, payload) })));
  const gone = results.filter((r) => r.result === "gone").map((r) => r.sub.id);
  if (gone.length > 0) await db.delete(pushSubscriptions).where(inArray(pushSubscriptions.id, gone));
  return results.filter((r) => r.result === "sent").length;
}
