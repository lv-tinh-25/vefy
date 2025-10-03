import { pgTable, text, date, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const ocrUsage = pgTable(
  "ocr_usage",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Calendar day in the app timezone (Asia/Ho_Chi_Minh)
    date: date("date", { mode: "string" }).notNull(),
    count: integer("count").notNull().default(0),
    lastAt: timestamp("last_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.date] })],
);
