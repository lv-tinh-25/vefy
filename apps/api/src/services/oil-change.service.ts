import { db } from "@vefy/db";
import { oilChanges, expenses } from "@vefy/db";
import { and, eq, desc } from "drizzle-orm";
import type { InsertOilChange, OilChange } from "@vefy/shared";

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

export async function listByVehicle(vehicleId: string) {
  const rows = await db
    .select()
    .from(oilChanges)
    .where(eq(oilChanges.vehicleId, vehicleId))
    .orderBy(desc(oilChanges.date));

  return rows.map(toOilChange);
}

export class OdometerTooLowError extends Error {
  constructor(readonly minOdometer: number) {
    super(`Odometer must be at least ${minOdometer} km`);
  }
}

export async function create(data: InsertOilChange) {
  // A newer (or same-day) record can't have a lower odometer than the latest one
  const existing = await db
    .select()
    .from(oilChanges)
    .where(eq(oilChanges.vehicleId, data.vehicleId))
    .orderBy(desc(oilChanges.date));

  if (existing.length > 0) {
    const latest = existing[0];
    if (data.date >= latest.date && data.odometer < latest.odometer) {
      throw new OdometerTooLowError(latest.odometer);
    }
  }

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(oilChanges)
      .values({
        vehicleId: data.vehicleId,
        date: data.date,
        odometer: data.odometer,
        cost: data.cost,
        oilType: data.oilType || null,
        note: data.note || null,
      })
      .returning();

    await tx.insert(expenses).values({
      vehicleId: row.vehicleId,
      oilChangeId: row.id,
      date: row.date,
      amount: row.cost,
      category: "part",
      // Display name is translated on the client for oil-change expenses
      name: "Oil change",
      note: null,
    });

    return toOilChange(row);
  });
}

export async function remove(id: string, vehicleId: string) {
  await db.delete(oilChanges).where(and(eq(oilChanges.id, id), eq(oilChanges.vehicleId, vehicleId)));
}
