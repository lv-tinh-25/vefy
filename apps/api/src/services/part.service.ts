import { db } from "@vefy/db";
import { parts, expenses } from "@vefy/db";
import { eq, asc } from "drizzle-orm";
import type { InsertPart, Part } from "@vefy/shared";

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
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

export async function listByVehicle(vehicleId: string) {
  const rows = await db
    .select()
    .from(parts)
    .where(eq(parts.vehicleId, vehicleId))
    .orderBy(asc(parts.warrantyExpiry));

  return rows.map(toPart);
}

export async function create(data: InsertPart) {
  const warrantyExpiry = addMonths(data.installDate, data.warrantyMonths ?? 12);

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(parts)
      .values({
        vehicleId: data.vehicleId,
        name: data.name,
        installDate: data.installDate,
        warrantyMonths: data.warrantyMonths ?? 12,
        warrantyExpiry,
        odometer: data.odometer ?? null,
        cost: data.cost,
        note: data.note || null,
      })
      .returning();

    await tx.insert(expenses).values({
      vehicleId: row.vehicleId,
      partId: row.id,
      date: row.installDate,
      amount: row.cost,
      category: "part",
      name: row.name,
      note: null,
    });

    return toPart(row);
  });
}

export async function remove(id: string) {
  await db.delete(parts).where(eq(parts.id, id));
}
