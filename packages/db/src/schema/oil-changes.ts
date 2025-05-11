import { pgTable, uuid, varchar, integer, date, text, timestamp } from "drizzle-orm/pg-core";
import { vehicles } from "./vehicles";

export const oilChanges = pgTable("oil_changes", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  date: date("date", { mode: "string" }).notNull(),
  odometer: integer("odometer").notNull(),
  cost: integer("cost").notNull().default(0),
  oilType: varchar("oil_type", { length: 100 }),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
