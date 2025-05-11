import { db } from "@vefy/db";
import { expenses, vehicles } from "@vefy/db";
import { eq, desc } from "drizzle-orm";
import {
  groupExpensesByPeriod,
  type Expense,
  type ExpenseSummary,
  type StatsPeriod,
} from "@vefy/shared";

function toExpense(row: typeof expenses.$inferSelect): Expense {
  return {
    id: row.id,
    vehicleId: row.vehicleId,
    oilChangeId: row.oilChangeId,
    partId: row.partId,
    date: row.date,
    amount: row.amount,
    category: row.category,
    name: row.name,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listByVehicle(vehicleId: string): Promise<Expense[]> {
  const rows = await db
    .select()
    .from(expenses)
    .where(eq(expenses.vehicleId, vehicleId))
    .orderBy(desc(expenses.date), desc(expenses.createdAt));
  return rows.map(toExpense);
}

export async function listByUser(userId: string): Promise<Expense[]> {
  const rows = await db
    .select({ expense: expenses })
    .from(expenses)
    .innerJoin(vehicles, eq(expenses.vehicleId, vehicles.id))
    .where(eq(vehicles.userId, userId))
    .orderBy(desc(expenses.date), desc(expenses.createdAt));
  return rows.map((r) => toExpense(r.expense));
}

export async function createOther(data: {
  vehicleId: string;
  date: string;
  amount: number;
  name: string;
  note?: string;
}): Promise<Expense> {
  const [row] = await db
    .insert(expenses)
    .values({
      vehicleId: data.vehicleId,
      date: data.date,
      amount: data.amount,
      category: "other",
      name: data.name,
      note: data.note || null,
    })
    .returning();
  return toExpense(row);
}

export async function remove(id: string) {
  const [row] = await db.select().from(expenses).where(eq(expenses.id, id));
  if (!row) throw new Error("expense.notFound");
  if (row.oilChangeId || row.partId) {
    throw new Error("expense.linkedReadonly");
  }
  await db.delete(expenses).where(eq(expenses.id, id));
}

export async function summaryByVehicle(
  vehicleId: string,
  period: StatsPeriod,
): Promise<ExpenseSummary[]> {
  const list = await listByVehicle(vehicleId);
  return groupExpensesByPeriod(list, period);
}

export async function summaryByUser(
  userId: string,
  period: StatsPeriod,
): Promise<ExpenseSummary[]> {
  const list = await listByUser(userId);
  return groupExpensesByPeriod(list, period);
}
