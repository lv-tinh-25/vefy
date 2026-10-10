import { describe, expect, it } from "vitest";
import {
  computeAvgKmPerDay,
  oilPredictionToAlert,
  predictOilChange,
  predictOilChanges,
} from "../utils/oil-prediction";
import { resolveOilSettings, type OilKind, type OilSetting } from "../constants/oil";
import type { OilChange } from "../schemas/oil-change";

function oil(date: string, odometer: number, kind: OilKind = "engine"): OilChange {
  return { id: `${kind}-${date}`, vehicleId: "v1", kind, date, odometer, cost: 0, oilType: null, note: null, createdAt: date };
}

function setting(overrides: Partial<OilSetting> = {}): OilSetting {
  return { kind: "engine", enabled: true, cycleKm: 5000, useDays: false, cycleDays: 180, ...overrides };
}

const NOW = new Date("2026-09-28T03:00:00Z");

describe("computeAvgKmPerDay", () => {
  it("needs two records", () => {
    expect(computeAvgKmPerDay([oil("2026-05-01", 10000)])).toBeNull();
  });

  it("measures across every kind", () => {
    // 3000 km over 100 days
    expect(computeAvgKmPerDay([oil("2026-05-01", 10000), oil("2026-08-09", 13000, "gear")])).toBe(30);
  });

  it("ignores same-day or non-increasing history", () => {
    expect(computeAvgKmPerDay([oil("2026-05-01", 10000), oil("2026-05-01", 10000, "gear")])).toBeNull();
  });
});

describe("predictOilChange", () => {
  it("returns null without history", () => {
    expect(predictOilChange([], setting(), 30, NOW)).toBeNull();
  });

  it("can't predict by km without an average", () => {
    const p = predictOilChange([oil("2026-08-29", 10000)], setting(), null, NOW);
    expect(p).toMatchObject({ daysSinceLast: 30, daysUntilByKm: null, effectiveDaysRemaining: null });
  });

  it("predicts by time alone from a single record", () => {
    const p = predictOilChange([oil("2026-08-29", 10000)], setting({ useDays: true, cycleDays: 40 }), null, NOW);
    expect(p).toMatchObject({ daysUntilByTime: 10, effectiveDaysRemaining: 10, urgency: "warning" });
  });

  it("projects the kind's cycle from the vehicle average", () => {
    // 30 km/day, 50 days since last => ~1500 km driven of 5000
    const p = predictOilChange([oil("2026-08-09", 13000)], setting(), 30, NOW);
    expect(p).toMatchObject({ estimatedOdo: 14500, kmSinceLast: 1500, daysUntilByKm: 117, urgency: "ok" });
  });

  it("takes the earlier of km and time limits", () => {
    const p = predictOilChange([oil("2026-08-09", 13000)], setting({ useDays: true, cycleDays: 60 }), 30, NOW);
    expect(p).toMatchObject({ daysUntilByTime: 10, effectiveDaysRemaining: 10, urgency: "warning" });
  });

  it("is overdue once the cycle is used up", () => {
    const p = predictOilChange([oil("2026-08-09", 13000)], setting({ cycleKm: 1000 }), 30, NOW);
    expect(p).toMatchObject({ daysUntilByKm: 0, urgency: "overdue" });
  });
});

describe("predictOilChanges", () => {
  const scooter = resolveOilSettings("motorcycle", "scooter", []);

  it("predicts each kind from its own latest record with its own cycle", () => {
    const history = [
      oil("2026-05-01", 10000),
      oil("2026-05-01", 10000, "gear"),
      oil("2026-08-09", 13000),
    ];
    const [engine, gear] = predictOilChanges(history, scooter, NOW);
    // 30 km/day; engine: 1500 of 2000 km since 08-09; gear: 4500 of 6000 km since 05-01
    expect(engine).toMatchObject({ kind: "engine", lastOdo: 13000, kmSinceLast: 1500, daysUntilByKm: 17 });
    expect(gear).toMatchObject({ kind: "gear", lastOdo: 10000, kmSinceLast: 4500, daysUntilByKm: 50 });
  });

  it("skips disabled kinds and kinds without records", () => {
    const settings = scooter.map((s) => (s.kind === "gear" ? { ...s, enabled: false } : s));
    const history = [oil("2026-05-01", 10000, "gear"), oil("2026-08-09", 13000)];
    expect(predictOilChanges(history, settings, NOW).map((p) => p.kind)).toEqual(["engine"]);
    expect(predictOilChanges([], scooter, NOW)).toEqual([]);
  });
});

describe("oilPredictionToAlert", () => {
  it("keys alerts per kind, keeping the legacy key for engine oil", () => {
    const engine = predictOilChange([oil("2026-08-09", 13000)], setting(), 30, NOW)!;
    const gear = predictOilChange([oil("2026-08-09", 13000, "gear")], setting({ kind: "gear" }), 30, NOW)!;
    expect(oilPredictionToAlert(engine, "v1")).toMatchObject({ key: "oil_change:v1:2026-08-09", oilKind: "engine" });
    expect(oilPredictionToAlert(gear, "v1")).toMatchObject({ key: "oil_change:v1:gear:2026-08-09", oilKind: "gear" });
  });

  it("maps urgency to status", () => {
    const p = predictOilChange([oil("2026-08-09", 13000)], setting({ cycleKm: 1000 }), 30, NOW)!;
    expect(oilPredictionToAlert(p, "v1")).toMatchObject({ status: "danger", daysRemaining: 0 });
  });
});

describe("resolveOilSettings", () => {
  it("returns the kinds of each profile with stored overrides", () => {
    const stored = [setting({ cycleKm: 3000 })];
    expect(resolveOilSettings("motorcycle", "manual", stored)).toEqual([setting({ cycleKm: 3000 })]);
    expect(resolveOilSettings("motorcycle", null, []).map((s) => s.cycleKm)).toEqual([2000]);
    expect(resolveOilSettings("motorcycle", "electric", stored)).toEqual([]);
    expect(resolveOilSettings("car", null, []).map((s) => s.kind)).toEqual([
      "engine", "transmission", "brake", "power_steering", "differential",
    ]);
  });
});
