import type { Expense, ExpenseSummary } from "../schemas/expense";
import { todayDateStr } from "./date";

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

export const CHART_YEARS = 5;

/**
 * Fixed chart slots so empty periods still get a column: the 12 months of the current year, or the
 * last CHART_YEARS years. Periods outside the window are dropped.
 */
export function fillChartPeriods(
  summary: ExpenseSummary[],
  period: StatsPeriod,
  now: Date = new Date(),
): ExpenseSummary[] {
  const year = Number(todayDateStr(now).slice(0, 4));
  const keys =
    period === "month"
      ? Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`)
      : Array.from({ length: CHART_YEARS }, (_, i) => String(year - CHART_YEARS + 1 + i));
  return keys.map(
    (key) => summary.find((s) => s.period === key) ?? { period: key, part: 0, other: 0, total: 0 },
  );
}
