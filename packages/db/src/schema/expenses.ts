import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  date,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { vehicles } from "./vehicles";
import { oilChanges } from "./oil-changes";
import { parts } from "./parts";

export const expenseCategoryEnum = pgEnum("expense_category", ["part", "other"]);

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  oilChangeId: uuid("oil_change_id").references(() => oilChanges.id, {
    onDelete: "cascade",
  }),
  partId: uuid("part_id").references(() => parts.id, { onDelete: "cascade" }),
  date: date("date", { mode: "string" }).notNull(),
  amount: integer("amount").notNull(),
  category: expenseCategoryEnum("category").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
