import { db } from "@vefy/db";
import { parts, expenses } from "@vefy/db";
import { and, eq, desc } from "drizzle-orm";
import { addMonthsToDate, type InsertParts, type Part } from "@vefy/shared";

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
    .orderBy(desc(parts.installDate), desc(parts.createdAt));

  return rows.map(toPart);
}

/** Records several parts installed on the same day: one part (and expense) per item. */
export async function create(vehicleId: string, data: InsertParts) {
  return db.transaction(async (tx) => {
    const rows = await tx
      .insert(parts)
      .values(
        data.items.map((item) => {
          const warrantyMonths = item.noWarranty ? null : (item.warrantyMonths ?? null);
          return {
            vehicleId,
            name: item.name,
            installDate: data.installDate,
            warrantyMonths,
            warrantyExpiry: warrantyMonths ? addMonthsToDate(data.installDate, warrantyMonths) : null,
            odometer: data.odometer ?? null,
            cost: item.cost,
            note: item.note || null,
          };
        }),
      )
      .returning();

    await tx.insert(expenses).values(
      rows.map((row) => ({
        vehicleId,
        partId: row.id,
        date: row.installDate,
        amount: row.cost,
        category: "part" as const,
        name: row.name,
        note: null,
      })),
    );

    return rows.map(toPart);
  });
}

export async function remove(id: string, vehicleId: string) {
  await db.delete(parts).where(and(eq(parts.id, id), eq(parts.vehicleId, vehicleId)));
}
