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

export async function create(data: InsertOilChange) {
  // Validate odometer >= lần trước (khi ngày mới hơn)
  const existing = await db
    .select()
    .from(oilChanges)
    .where(eq(oilChanges.vehicleId, data.vehicleId))
    .orderBy(desc(oilChanges.date));

  if (existing.length > 0) {
    const latest = existing[0];
    if (data.date >= latest.date && data.odometer < latest.odometer) {
      throw new Error(`Số Odo phải ≥ ${latest.odometer} km (lần trước)`);
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
      name: "Thay nhớt",
      note: null,
    });

    return toOilChange(row);
  });
}

export async function remove(id: string, vehicleId: string) {
  await db.delete(oilChanges).where(and(eq(oilChanges.id, id), eq(oilChanges.vehicleId, vehicleId)));
}
