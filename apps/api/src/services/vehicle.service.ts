import { db } from "@vefy/db";
import { vehicles, oilChanges, parts, vehicleOilSettings, expenses } from "@vefy/db";
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
import * as uploadService from "./upload.service";

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
    imageUrl: row.imageUrl,
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
      .orderBy(desc(oilChanges.date), desc(oilChanges.odometer), desc(oilChanges.createdAt)),
    db
      .select()
      .from(parts)
      .where(eq(parts.vehicleId, row.id))
      .orderBy(desc(parts.installDate), desc(parts.createdAt)),
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

/**
 * The variant decides which oil kinds apply, so it's fixed once the vehicle has any expense; oil
 * changes and parts each create one, so this also covers them.
 */
async function hasExpenses(vehicleId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: expenses.id })
    .from(expenses)
    .where(eq(expenses.vehicleId, vehicleId))
    .limit(1);
  return !!row;
}

export async function getById(id: string) {
  const [row] = await db.select().from(vehicles).where(eq(vehicles.id, id));
  if (!row) return null;

  const [{ vehicle, oilData, partData, oilSettings, oilPredictions, alerts }, variantLocked] =
    await Promise.all([loadVehicleState(row, new Date()), hasExpenses(id)]);

  return {
    ...vehicle,
    oilChanges: oilData,
    parts: partData,
    alerts,
    oilSettings,
    oilPredictions,
    variantLocked,
  };
}

export async function listAllAlerts(userId: string) {
  const vehicleRows = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.userId, userId));

  const now = new Date();
  const states = await Promise.all(vehicleRows.map((row) => loadVehicleState(row, now)));
  return {
    alerts: states.flatMap((s) => getActiveAlerts(s.alerts)),
    vehicleNames: Object.fromEntries(vehicleRows.map((row) => [row.id, row.name])) as Record<string, string>,
  };
}

export interface VehicleAlerts {
  vehicle: Vehicle;
  alerts: Alert[];
}

/** Active alerts of every vehicle, grouped by owner; used by the daily reminder job */
export async function listActiveAlertsByUser(now: Date): Promise<Map<string, VehicleAlerts[]>> {
  const rows = await db.select().from(vehicles);
  const byUser = new Map<string, VehicleAlerts[]>();
  // Small batches: each vehicle runs 3 queries and the pool holds 5 connections
  const BATCH = 4;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const states = await Promise.all(batch.map((row) => loadVehicleState(row, now)));
    states.forEach(({ vehicle, alerts }, j) => {
      const active = getActiveAlerts(alerts);
      if (active.length === 0) return;
      const userId = batch[j].userId;
      byUser.set(userId, [...(byUser.get(userId) ?? []), { vehicle, alerts: active }]);
    });
  }
  return byUser;
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
      if (await hasExpenses(id)) throw new VariantLockedError();
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

export async function setImage(id: string, dataUrl: string): Promise<string> {
  const imageUrl = await uploadService.uploadVehicleImage(id, dataUrl);
  await db.update(vehicles).set({ imageUrl, updatedAt: new Date() }).where(eq(vehicles.id, id));
  return imageUrl;
}

export async function clearImage(id: string) {
  await uploadService.deleteVehicleImage(id);
  await db.update(vehicles).set({ imageUrl: null, updatedAt: new Date() }).where(eq(vehicles.id, id));
}

export async function remove(id: string) {
  const [row] = await db
    .delete(vehicles)
    .where(eq(vehicles.id, id))
    .returning({ imageUrl: vehicles.imageUrl });
  // Best effort: an orphaned file is harmless, a failed delete response is not
  if (row?.imageUrl) await uploadService.deleteVehicleImage(id).catch(() => {});
}
