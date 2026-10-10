import { db } from "@vefy/db";
import { vehicles, oilChanges, parts, vehicleOilSettings } from "@vefy/db";
import { and, eq, desc } from "drizzle-orm";
import {
  computeAllAlerts,
  getActiveAlerts,
  countAlertsByStatus,
  predictOilChanges,
  oilPredictionToAlert,
  resolveOilSettings,
  type Alert,
  type Vehicle,
  type Part,
  type InsertVehicle,
  type UpdateVehicleInfo,
} from "@vefy/shared";
import { toOilChange } from "./oil-change.service";

function toVehicle(row: typeof vehicles.$inferSelect): Vehicle {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    variant: row.type === "car" ? null : row.variant,
    name: row.name,
    brand: row.brand,
    model: row.model,
    year: row.year,
    licensePlate: row.licensePlate,
    color: row.color,
    warrantyExpiry: row.warrantyExpiry,
    registrationExpiry: row.registrationExpiry,
    insuranceExpiry: row.insuranceExpiry,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
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

async function loadVehicleState(row: typeof vehicles.$inferSelect, now: Date) {
  const vehicle = toVehicle(row);
  const [ocs, ps, storedSettings] = await Promise.all([
    db
      .select()
      .from(oilChanges)
      .where(eq(oilChanges.vehicleId, row.id))
      .orderBy(desc(oilChanges.date), desc(oilChanges.odometer)),
    db.select().from(parts).where(eq(parts.vehicleId, row.id)),
    db.select().from(vehicleOilSettings).where(eq(vehicleOilSettings.vehicleId, row.id)),
  ]);

  const oilData = ocs.map(toOilChange);
  const partData = ps.map(toPart);
  const oilSettings = resolveOilSettings(vehicle.type, vehicle.variant, storedSettings);
  const oilPredictions = predictOilChanges(oilData, oilSettings, now);
  const oilAlerts = oilPredictions
    .map((p) => oilPredictionToAlert(p, vehicle.id))
    .filter((a): a is Alert => a !== null);
  const alerts = computeAllAlerts(vehicle, partData, oilAlerts, now);

  return { vehicle, oilData, partData, oilSettings, oilPredictions, alerts };
}

export async function listAll(userId: string) {
  const rows = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, userId));
  const now = new Date();

  return Promise.all(
    rows.map(async (row) => {
      const { vehicle, oilData, partData, alerts } = await loadVehicleState(row, now);
      return {
        ...vehicle,
        alertSummary: countAlertsByStatus(alerts),
        activeAlertCount: getActiveAlerts(alerts).length,
        oilChangeCount: oilData.length,
        partCount: partData.length,
      };
    }),
  );
}

export async function getById(id: string) {
  const [row] = await db.select().from(vehicles).where(eq(vehicles.id, id));
  if (!row) return null;

  const { vehicle, oilData, partData, oilSettings, oilPredictions, alerts } =
    await loadVehicleState(row, new Date());

  return {
    ...vehicle,
    oilChanges: oilData,
    parts: partData,
    alerts,
    oilSettings,
    oilPredictions,
  };
}

export async function listAllAlerts(userId: string) {
  const vehicleRows = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, userId));

  const now = new Date();
  const states = await Promise.all(vehicleRows.map((row) => loadVehicleState(row, now)));
  return states.flatMap((s) => getActiveAlerts(s.alerts));
}

export async function create(userId: string, data: InsertVehicle) {
  const name = data.name || `${data.brand} ${data.model}`;

  const [row] = await db
    .insert(vehicles)
    .values({
      userId,
      type: data.type,
      variant: data.type === "car" ? null : data.variant,
      name,
      brand: data.brand,
      model: data.model,
      year: data.year,
      licensePlate: data.licensePlate,
      color: data.color,
    })
    .returning();

  return toVehicle(row);
}

export class VariantLockedError extends Error {}

export async function update(id: string, data: UpdateVehicleInfo) {
  const { variant, ...rest } = data;
  const changes: Partial<typeof vehicles.$inferInsert> = rest;

  if (variant !== undefined) {
    const [current] = await db
      .select({ type: vehicles.type, variant: vehicles.variant })
      .from(vehicles)
      .where(eq(vehicles.id, id));
    if (current?.type === "motorcycle" && current.variant !== variant) {
      // The variant decides which oil kinds apply, so it's fixed once oil history exists
      const [oilChange] = await db
        .select({ id: oilChanges.id })
        .from(oilChanges)
        .where(eq(oilChanges.vehicleId, id))
        .limit(1);
      if (oilChange) throw new VariantLockedError();
      changes.variant = variant;
    }
  }

  const [row] = await db
    .update(vehicles)
    .set({ ...changes, updatedAt: new Date() })
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
