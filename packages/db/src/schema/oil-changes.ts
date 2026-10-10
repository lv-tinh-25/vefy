import { pgTable, pgEnum, uuid, varchar, integer, date, text, timestamp, boolean, primaryKey } from "drizzle-orm/pg-core";
import { OIL_KINDS } from "@vefy/shared";
import { vehicles } from "./vehicles";

export const oilKindEnum = pgEnum("oil_kind", OIL_KINDS);

export const oilChanges = pgTable("oil_changes", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  kind: oilKindEnum("kind").notNull().default("engine"),
  date: date("date", { mode: "string" }).notNull(),
  odometer: integer("odometer").notNull(),
  cost: integer("cost").notNull().default(0),
  oilType: varchar("oil_type", { length: 100 }),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/** Only kinds whose cycle differs from the defaults need a row; missing kinds use OIL_KIND_DEFAULTS */
export const vehicleOilSettings = pgTable(
  "vehicle_oil_settings",
  {
    vehicleId: uuid("vehicle_id")
      .notNull()
      .references(() => vehicles.id, { onDelete: "cascade" }),
    kind: oilKindEnum("kind").notNull(),
    enabled: boolean("enabled").notNull(),
    cycleKm: integer("cycle_km").notNull(),
    useDays: boolean("use_days").notNull(),
    cycleDays: integer("cycle_days").notNull(),
  },
  (t) => [primaryKey({ columns: [t.vehicleId, t.kind] })],
);
