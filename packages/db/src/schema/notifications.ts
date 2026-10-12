import { pgTable, uuid, text, timestamp, unique, index, boolean, primaryKey } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const dismissedAlerts = pgTable(
  "dismissed_alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    alertKey: text("alert_key").notNull(),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    unique("dismissed_alerts_user_key_unique").on(t.userId, t.alertKey),
    index("dismissed_alerts_user_idx").on(t.userId),
  ],
);

// One row per browser/device that allowed push notifications
export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull().unique(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("push_subscriptions_user_idx").on(t.userId)],
);

// Missing row = defaults (email reminders on)
export const notificationSettings = pgTable("notification_settings", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  emailReminders: boolean("email_reminders").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Which reminder stage of which alert was already sent, so the daily job never repeats one
export const reminderLog = pgTable(
  "reminder_log",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    alertKey: text("alert_key").notNull(),
    stage: text("stage").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.alertKey, t.stage] })],
);
