import { db } from "@vefy/db";
import { vehicles, oilChanges, parts } from "@vefy/db";
import { and, eq, desc } from "drizzle-orm";
import {
  computeAllAlerts,
  getActiveAlerts,
  countAlertsByStatus,
  predictOilChange,
  oilPredictionToAlert,
  OIL_CYCLE_DEFAULTS,
  type Alert,
  type Vehicle,
  type OilChange,
  type Part,
  type InsertVehicle,
  type UpdateVehicleInfo,
} from "@vefy/shared";

// userId is now passed from the auth middleware

function toVehicle(row: typeof vehicles.$inferSelect): Vehicle {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    name: row.name,
    brand: row.brand,
    model: row.model,
    year: row.year,
    licensePlate: row.licensePlate,
    color: row.color,
    warrantyExpiry: row.warrantyExpiry,
    registrationExpiry: row.registrationExpiry,
    insuranceExpiry: row.insuranceExpiry,
    oilCycleKm: row.oilCycleKm,
    oilUseDays: row.oilUseDays,
    oilCycleDays: row.oilCycleDays,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toOilChange(row: typeof oilChanges.$inferSelect): OilChange {
  return {
    id: row.id,
    vehicleId: row.vehicleId,
    date: row.date,
    odometer: row.odometer,
    cost: row.cost,
    oilType: row.oilType,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

function toPart(row: typeof parts.$inferSelect): Part {
  return {
    id: row.id,
    vehicleId: row.vehicleId,
    name: row.name,
    installDate: row.installDate,
    warrantyMonths: row.warrantyMonths,
    warrantyExpiry: row.warrantyExpiry,
    odometer: row.odometer,
    cost: row.cost,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listAll(userId: string) {
  const rows = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, userId));
  const now = new Date();

  const results = await Promise.all(
    rows.map(async (row) => {
      const vehicle = toVehicle(row);
      const ocs = await db
        .select()
        .from(oilChanges)
        .where(eq(oilChanges.vehicleId, row.id))
        .orderBy(desc(oilChanges.date));
      const ps = await db
        .select()
        .from(parts)
        .where(eq(parts.vehicleId, row.id));

      const oilData = ocs.map(toOilChange);
      const partData = ps.map(toPart);

      const prediction = predictOilChange(
        oilData,
        vehicle.oilCycleKm,
        vehicle.oilUseDays,
        vehicle.oilCycleDays,
        now,
      );
      const oilAlert = oilPredictionToAlert(prediction, vehicle.id);
      const alerts = computeAllAlerts(vehicle, partData, oilAlert, now);

      return {
        ...vehicle,
        alertSummary: countAlertsByStatus(alerts),
        activeAlertCount: getActiveAlerts(alerts).length,
        oilChangeCount: ocs.length,
        partCount: ps.length,
      };
    }),
  );

  return results;
}

export async function getById(id: string) {
  const [row] = await db.select().from(vehicles).where(eq(vehicles.id, id));
  if (!row) return null;

  const vehicle = toVehicle(row);
  const now = new Date();

  const ocs = await db
    .select()
    .from(oilChanges)
    .where(eq(oilChanges.vehicleId, id))
    .orderBy(desc(oilChanges.date));

  const ps = await db
    .select()
    .from(parts)
    .where(eq(parts.vehicleId, id));

  const oilData = ocs.map(toOilChange);
  const partData = ps.map(toPart);

  const prediction = predictOilChange(
    oilData,
    vehicle.oilCycleKm,
    vehicle.oilUseDays,
    vehicle.oilCycleDays,
    now,
  );
  const oilAlert = oilPredictionToAlert(prediction, vehicle.id);
  const alerts = computeAllAlerts(vehicle, partData, oilAlert, now);

  return {
    ...vehicle,
    oilChanges: oilData,
    parts: partData,
    alerts,
    oilPrediction: prediction,
  };
}

export async function listAllAlerts(userId: string) {
  const vehicleRows = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, userId));

  const now = new Date();
  const allAlerts: Alert[] = [];

  for (const row of vehicleRows) {
    const vehicle = toVehicle(row);
    const [ocs, ps] = await Promise.all([
      db
        .select()
        .from(oilChanges)
        .where(eq(oilChanges.vehicleId, row.id))
        .orderBy(desc(oilChanges.date)),
      db.select().from(parts).where(eq(parts.vehicleId, row.id)),
    ]);

    const oilData = ocs.map(toOilChange);
    const partData = ps.map(toPart);

    const prediction = predictOilChange(
      oilData,
      vehicle.oilCycleKm,
      vehicle.oilUseDays,
      vehicle.oilCycleDays,
      now,
    );
    const oilAlert = oilPredictionToAlert(prediction, vehicle.id);
    const alerts = computeAllAlerts(vehicle, partData, oilAlert, now);

    allAlerts.push(...getActiveAlerts(alerts));
  }

  return allAlerts;
}

export async function create(userId: string, data: InsertVehicle) {
  const defaults = OIL_CYCLE_DEFAULTS[data.type];
  const name = data.name || `${data.brand} ${data.model}`;

  const [row] = await db
    .insert(vehicles)
    .values({
      userId,
      type: data.type,
      name,
      brand: data.brand,
      model: data.model,
      year: data.year,
      licensePlate: data.licensePlate,
      color: data.color,
      oilCycleKm: defaults.km,
      oilCycleDays: defaults.days,
    })
    .returning();

  return toVehicle(row);
}

export async function update(id: string, data: UpdateVehicleInfo) {
  const [row] = await db
    .update(vehicles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(vehicles.id, id))
    .returning();

  if (!row) return null;
  return toVehicle(row);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function isOwnedBy(id: string, userId: string): Promise<boolean> {
  // Non-UUID ids would make Postgres throw on the uuid column
  if (!UUID_RE.test(id)) return false;
  const [row] = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .where(and(eq(vehicles.id, id), eq(vehicles.userId, userId)));
  return !!row;
}

export async function remove(id: string) {
  await db.delete(vehicles).where(eq(vehicles.id, id));
}
