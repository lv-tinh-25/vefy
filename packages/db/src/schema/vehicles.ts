import { pgTable, uuid, text, varchar, integer, date, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const vehicleTypeEnum = pgEnum("vehicle_type", ["car", "motorcycle"]);

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  type: vehicleTypeEnum("type").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  licensePlate: varchar("license_plate", { length: 20 }).notNull(),
  color: varchar("color", { length: 30 }).notNull(),
  warrantyExpiry: date("warranty_expiry", { mode: "string" }),
  registrationExpiry: date("registration_expiry", { mode: "string" }),
  insuranceExpiry: date("insurance_expiry", { mode: "string" }),
  oilCycleKm: integer("oil_cycle_km").notNull().default(5000),
  oilUseDays: boolean("oil_use_days").notNull().default(false),
  oilCycleDays: integer("oil_cycle_days").notNull().default(180),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
