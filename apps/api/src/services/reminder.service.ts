import { db, dismissedAlerts, notificationSettings, reminderLog, user } from "@vefy/db";
import { and, eq, or } from "drizzle-orm";
import { reminderLogKey, selectDueReminders, type DueReminder } from "@vefy/shared";
import { sendReminderEmail, type ReminderEmailGroup } from "../lib/email";
import { getAppOrigin } from "../lib/origin";
import { reminderLine, reminderPushPayload, type VehicleReminders } from "../lib/reminder-text";
import { createUnsubscribeToken } from "../lib/unsubscribe-token";
import * as pushService from "./push.service";
import * as vehicleService from "./vehicle.service";

export async function getSettings(userId: string) {
  const [row] = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
  return { emailReminders: row?.emailReminders ?? true };
}

export async function setEmailReminders(userId: string, emailReminders: boolean) {
  await db
    .insert(notificationSettings)
    .values({ userId, emailReminders })
    .onConflictDoUpdate({ target: notificationSettings.userId, set: { emailReminders, updatedAt: new Date() } });
}

export interface ReminderRunStats {
  users: number;
  reminders: number;
  pushSent: number;
  emailsSent: number;
  failures: number;
}

/** Daily job: send each alert's current reminder stage once, by push and/or email */
export async function runDailyReminders(now = new Date()): Promise<ReminderRunStats> {
  const origin = getAppOrigin();
  const stats: ReminderRunStats = { users: 0, reminders: 0, pushSent: 0, emailsSent: 0, failures: 0 };
  const alertsByUser = await vehicleService.listActiveAlertsByUser(now);

  for (const [userId, vehicles] of alertsByUser) {
    try {
      const [dismissed, sent] = await Promise.all([
        db.select({ key: dismissedAlerts.alertKey }).from(dismissedAlerts).where(eq(dismissedAlerts.userId, userId)),
        db.select().from(reminderLog).where(eq(reminderLog.userId, userId)),
      ]);
      const dismissedKeys = new Set(dismissed.map((d) => d.key));
      const sentStages = new Set(sent.map((s) => reminderLogKey(s.alertKey, s.stage as DueReminder["stage"])));

      const due = vehicles.flatMap(({ vehicle, alerts }) =>
        selectDueReminders(alerts, dismissedKeys, sentStages).map((r) => ({ ...r, vehicle })),
      );
      if (due.length === 0) continue;

      // Claim the stages first: Vercel may start the cron twice, and only one run gets each row
      const claimedRows = await db
        .insert(reminderLog)
        .values(due.map((r) => ({ userId, alertKey: r.alert.key, stage: r.stage })))
        .onConflictDoNothing()
        .returning({ alertKey: reminderLog.alertKey, stage: reminderLog.stage });
      const claimed = new Set(claimedRows.map((r) => reminderLogKey(r.alertKey, r.stage as DueReminder["stage"])));
      const mine = due.filter((r) => claimed.has(reminderLogKey(r.alert.key, r.stage)));
      if (mine.length === 0) continue;

      const groups: VehicleReminders[] = [...new Set(mine.map((r) => r.vehicle.id))].map((vehicleId) => {
        const reminders = mine.filter((r) => r.vehicle.id === vehicleId);
        return { vehicleId, vehicleName: reminders[0].vehicle.name, reminders };
      });

      const pushSent = await pushService.sendToUser(userId, reminderPushPayload(groups, origin));

      let emailSent = false;
      const [account] = await db
        .select({ email: user.email, emailVerified: user.emailVerified })
        .from(user)
        .where(eq(user.id, userId));
      const { emailReminders } = await getSettings(userId);
      if (account?.emailVerified && emailReminders) {
        const emailGroups: ReminderEmailGroup[] = groups.map((g) => ({
          vehicleName: g.vehicleName,
          lines: g.reminders.map(reminderLine),
        }));
        try {
          await sendReminderEmail({
            to: account.email,
            groups: emailGroups,
            appUrl: `${origin}/garage`,
            unsubscribeUrl: `${origin}/api/reminders/unsubscribe?token=${createUnsubscribeToken(userId)}`,
          });
          emailSent = true;
        } catch (err) {
          // Still log the stage if the push went out, otherwise tomorrow would push it again
          stats.failures++;
          console.error("[reminders] email failed", userId, err);
        }
      }

      if (pushSent > 0 || emailSent) {
        stats.users++;
        stats.reminders += mine.length;
        stats.pushSent += pushSent;
        if (emailSent) stats.emailsSent++;
      } else {
        // Nothing reached the user: release the claim so turning a channel on later still delivers it
        await db
          .delete(reminderLog)
          .where(
            and(
              eq(reminderLog.userId, userId),
              or(...mine.map((r) => and(eq(reminderLog.alertKey, r.alert.key), eq(reminderLog.stage, r.stage)))),
            ),
          );
      }
    } catch (err) {
      stats.failures++;
      console.error("[reminders] user failed", userId, err);
    }
  }
  return stats;
}
