import type { Expense, ExpenseSummary } from "../schemas/expense";

export type StatsPeriod = "month" | "year";

export function periodKey(date: string, period: StatsPeriod): string {
  return period === "month" ? date.slice(0, 7) : date.slice(0, 4);
}

export function groupExpensesByPeriod(
  expenses: Expense[],
  period: StatsPeriod,
): ExpenseSummary[] {
  const map = new Map<string, ExpenseSummary>();
  for (const e of expenses) {
    const key = periodKey(e.date, period);
    const entry = map.get(key) ?? { period: key, part: 0, other: 0, total: 0 };
    entry[e.category] += e.amount;
    entry.total += e.amount;
    map.set(key, entry);
  }
  return Array.from(map.values()).sort((a, b) => a.period.localeCompare(b.period));
}

export function sumForPeriod(
  expenses: Expense[],
  period: StatsPeriod,
  targetKey: string,
): number {
  let total = 0;
  for (const e of expenses) {
    if (periodKey(e.date, period) === targetKey) total += e.amount;
  }
  return total;
}
