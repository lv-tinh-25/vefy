import { db, dismissedAlerts } from "@vefy/db";
import { eq } from "drizzle-orm";

export async function listDismissedKeys(userId: string): Promise<string[]> {
  const rows = await db
    .select({ alertKey: dismissedAlerts.alertKey })
    .from(dismissedAlerts)
    .where(eq(dismissedAlerts.userId, userId));
  return rows.map((r) => r.alertKey);
}

export async function dismissOne(userId: string, alertKey: string): Promise<void> {
  await db
    .insert(dismissedAlerts)
    .values({ userId, alertKey })
    .onConflictDoNothing({ target: [dismissedAlerts.userId, dismissedAlerts.alertKey] });
}

export async function dismissMany(userId: string, alertKeys: string[]): Promise<void> {
  if (alertKeys.length === 0) return;
  const values = alertKeys.map((alertKey) => ({ userId, alertKey }));
  await db
    .insert(dismissedAlerts)
    .values(values)
    .onConflictDoNothing({ target: [dismissedAlerts.userId, dismissedAlerts.alertKey] });
}
