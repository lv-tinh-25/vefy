import { pgTable, uuid, varchar, integer, date, text, timestamp } from "drizzle-orm/pg-core";
import { vehicles } from "./vehicles";

export const parts = pgTable("parts", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  installDate: date("install_date", { mode: "string" }).notNull(),
  warrantyMonths: integer("warranty_months").notNull().default(12),
  warrantyExpiry: date("warranty_expiry", { mode: "string" }).notNull(),
  odometer: integer("odometer"),
  cost: integer("cost").notNull().default(0),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
