import { describe, expect, it } from "vitest";
import { predictOilChange } from "../utils/oil-prediction";
import type { OilChange } from "../schemas/oil-change";

function oil(date: string, odometer: number): OilChange {
  return { id: date, vehicleId: "v1", date, odometer, cost: 0, oilType: null, note: null, createdAt: date };
}

describe("predictOilChange", () => {
  it("returns null without history", () => {
    expect(predictOilChange([], 5000, false, 180, new Date())).toBeNull();
  });

  it("needs two records before predicting", () => {
    const p = predictOilChange([oil("2026-09-01", 10000)], 5000, false, 180, new Date("2026-10-01T03:00:00Z"));
    expect(p).toMatchObject({ daysSinceLast: 30, effectiveDaysRemaining: null });
  });

  it("projects from the average km/day across history", () => {
    // 3000 km over 100 days = 30 km/day; 50 days since last => ~1500 km driven
    const p = predictOilChange(
      [oil("2026-05-01", 10000), oil("2026-08-09", 13000)],
      5000,
      false,
      180,
      new Date("2026-09-28T03:00:00Z"),
    );
    expect(p).toMatchObject({ avgKmPerDay: 30, daysSinceLast: 50, kmSinceLast: 1500, daysUntilByKm: 117 });
  });

  it("takes the earlier of km and time limits", () => {
    const p = predictOilChange(
      [oil("2026-05-01", 10000), oil("2026-08-09", 13000)],
      5000,
      true,
      60,
      new Date("2026-09-28T03:00:00Z"),
    );
    expect(p).toMatchObject({ daysUntilByTime: 10, effectiveDaysRemaining: 10, urgency: "warning" });
  });
});
