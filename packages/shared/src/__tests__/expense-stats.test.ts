import { describe, expect, it } from "vitest";
import { groupExpensesByPeriod, sumForPeriod } from "../utils/expense-stats";
import type { Expense } from "../schemas/expense";

function expense(date: string, amount: number, category: Expense["category"]): Expense {
  return { id: date + amount, vehicleId: "v1", oilChangeId: null, partId: null, date, amount, category, name: "x", note: null, createdAt: date };
}

const EXPENSES = [
  expense("2026-09-15", 100, "part"),
  expense("2026-10-01", 200, "other"),
  expense("2026-10-03", 300, "part"),
];

describe("expense stats", () => {
  it("groups by month with category split", () => {
    expect(groupExpensesByPeriod(EXPENSES, "month")).toEqual([
      { period: "2026-09", part: 100, other: 0, total: 100 },
      { period: "2026-10", part: 300, other: 200, total: 500 },
    ]);
  });

  it("sums a single period", () => {
    expect(sumForPeriod(EXPENSES, "month", "2026-10")).toBe(500);
    expect(sumForPeriod(EXPENSES, "year", "2026")).toBe(600);
  });
});
