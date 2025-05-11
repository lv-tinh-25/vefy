import { pgTable, uuid, text, timestamp, unique, index } from "drizzle-orm/pg-core";
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
