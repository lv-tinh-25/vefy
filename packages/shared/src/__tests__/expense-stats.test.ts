import { describe, expect, it } from "vitest";
import { fillChartPeriods, groupExpensesByPeriod, sumForPeriod } from "../utils/expense-stats";
import type { Expense } from "../schemas/expense";

function expense(date: string, amount: number, category: Expense["category"]): Expense {
  return { id: date + amount, vehicleId: "v1", oilChangeId: null, oilKind: null, partId: null, date, amount, category, name: "x", note: null, createdAt: date };
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

  it("fills the 12 months of the current VN year", () => {
    // 2026-12-31 18:00 UTC is already 2027-01-01 in Vietnam
    const filled = fillChartPeriods(
      [{ period: "2027-03", part: 1, other: 0, total: 1 }, { period: "2026-12", part: 9, other: 0, total: 9 }],
      "month",
      new Date("2026-12-31T18:00:00Z"),
    );
    expect(filled.map((s) => s.period)).toEqual([
      "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06",
      "2027-07", "2027-08", "2027-09", "2027-10", "2027-11", "2027-12",
    ]);
    expect(filled[2].total).toBe(1);
    expect(filled[0]).toEqual({ period: "2027-01", part: 0, other: 0, total: 0 });
  });

  it("fills the last five years", () => {
    const filled = fillChartPeriods(
      [{ period: "2019", part: 5, other: 0, total: 5 }, { period: "2024", part: 0, other: 7, total: 7 }],
      "year",
      new Date("2026-10-10T03:00:00Z"),
    );
    expect(filled.map((s) => s.period)).toEqual(["2022", "2023", "2024", "2025", "2026"]);
    expect(filled[2].other).toBe(7);
  });
});
