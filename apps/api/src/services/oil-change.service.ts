import { db } from "@vefy/db";
import { oilChanges, expenses, vehicles, vehicleOilSettings } from "@vefy/db";
import { and, eq, desc } from "drizzle-orm";
import {
  resolveOilSettings,
  type InsertOilChanges,
  type OilChange,
  type OilSetting,
} from "@vefy/shared";

export function toOilChange(row: typeof oilChanges.$inferSelect): OilChange {
  return {
    id: row.id,
    vehicleId: row.vehicleId,
    kind: row.kind,
    date: row.date,
    odometer: row.odometer,
    cost: row.cost,
    oilType: row.oilType,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listByVehicle(vehicleId: string) {
  const rows = await db
    .select()
    .from(oilChanges)
    .where(eq(oilChanges.vehicleId, vehicleId))
    .orderBy(desc(oilChanges.date), desc(oilChanges.odometer), desc(oilChanges.createdAt));

  return rows.map(toOilChange);
}

export async function getSettings(vehicleId: string): Promise<OilSetting[]> {
  const [vehicle] = await db
    .select({ type: vehicles.type, variant: vehicles.variant })
    .from(vehicles)
    .where(eq(vehicles.id, vehicleId));
  if (!vehicle) return [];

  const stored = await db
    .select()
    .from(vehicleOilSettings)
    .where(eq(vehicleOilSettings.vehicleId, vehicleId));

  return resolveOilSettings(vehicle.type, vehicle.variant, stored);
}

export class OilKindUnavailableError extends Error {}

/** Replaces the settings of the given kinds; kinds that don't apply to the vehicle are rejected. */
export async function saveSettings(vehicleId: string, settings: OilSetting[]) {
  const applicable = new Set((await getSettings(vehicleId)).map((s) => s.kind));
  if (settings.some((s) => !applicable.has(s.kind))) throw new OilKindUnavailableError();

  await db.transaction(async (tx) => {
    for (const s of settings) {
      const values = {
        enabled: s.enabled,
        cycleKm: s.cycleKm,
        useDays: s.useDays,
        cycleDays: s.cycleDays,
      };
      await tx
        .insert(vehicleOilSettings)
        .values({ vehicleId, kind: s.kind, ...values })
        .onConflictDoUpdate({
          target: [vehicleOilSettings.vehicleId, vehicleOilSettings.kind],
          set: values,
        });
    }
  });
}

export class OdometerTooLowError extends Error {
  constructor(readonly minOdometer: number) {
    super(`Odometer must be at least ${minOdometer} km`);
  }
}

/** Records several kinds changed at the same visit: one oil change (and expense) per item. */
export async function create(vehicleId: string, data: InsertOilChanges) {
  const enabled = new Set(
    (await getSettings(vehicleId)).filter((s) => s.enabled).map((s) => s.kind),
  );
  if (data.items.some((item) => !enabled.has(item.kind))) throw new OilKindUnavailableError();

  // The odometer belongs to the vehicle, so check it against the latest record of any kind
  const [latest] = await db
    .select()
    .from(oilChanges)
    .where(eq(oilChanges.vehicleId, vehicleId))
    .orderBy(desc(oilChanges.date), desc(oilChanges.odometer), desc(oilChanges.createdAt))
    .limit(1);

  if (latest && data.date >= latest.date && data.odometer < latest.odometer) {
    throw new OdometerTooLowError(latest.odometer);
  }

  return db.transaction(async (tx) => {
    const rows = await tx
      .insert(oilChanges)
      .values(
        data.items.map((item) => ({
          vehicleId,
          kind: item.kind,
          date: data.date,
          odometer: data.odometer,
          cost: item.cost,
          oilType: item.oilType || null,
          note: item.note || null,
        })),
      )
      .returning();

    await tx.insert(expenses).values(
      rows.map((row) => ({
        vehicleId,
        oilChangeId: row.id,
        date: row.date,
        amount: row.cost,
        category: "part" as const,
        // Display name is translated on the client from the oil change kind
        name: "Oil change",
        note: null,
      })),
    );

    return rows.map(toOilChange);
  });
}

export async function remove(id: string, vehicleId: string) {
  await db.delete(oilChanges).where(and(eq(oilChanges.id, id), eq(oilChanges.vehicleId, vehicleId)));
}
