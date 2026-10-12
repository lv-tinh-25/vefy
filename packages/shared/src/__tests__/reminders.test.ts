import { describe, expect, it } from "vitest";
import { reminderLogKey, reminderStage, selectDueReminders } from "../utils/reminders";
import type { Alert } from "../utils/alerts";

function alert(daysRemaining: number | null, overrides: Partial<Alert> = {}): Alert {
  const status = daysRemaining === null ? "neutral" : daysRemaining < 0 ? "danger" : daysRemaining <= 30 ? "warning" : "success";
  return {
    type: "insurance",
    status,
    daysRemaining,
    expiryDate: "2026-11-01",
    vehicleId: "v1",
    key: `insurance:v1:${daysRemaining}`,
    ...overrides,
  };
}

describe("reminderStage", () => {
  it.each([
    [30, "start"],
    [8, "start"],
    [7, "week"],
    [2, "week"],
    [1, "day"],
    [0, "day"],
    [-1, "overdue"],
    [-100, "overdue"],
  ] as const)("%i days → %s", (days, stage) => {
    expect(reminderStage(alert(days))).toBe(stage);
  });

  it("treats an overdue oil change (0 days, danger) as overdue", () => {
    expect(reminderStage(alert(0, { type: "oil_change", status: "danger" }))).toBe("overdue");
  });

  it("ignores alerts that aren't warning or danger", () => {
    expect(reminderStage(alert(45))).toBeNull();
    expect(reminderStage(alert(null))).toBeNull();
  });

  it("uses the status, not the day count, to decide whether to remind", () => {
    // Oil alerts warn from 14 days; a 20-day oil alert is still "success"
    expect(reminderStage(alert(20, { status: "success" }))).toBeNull();
    expect(reminderStage(alert(14, { status: "warning" }))).toBe("start");
  });
});

describe("selectDueReminders", () => {
  it("returns each alert's current stage once", () => {
    const a = alert(5);
    expect(selectDueReminders([a], new Set(), new Set())).toEqual([{ alert: a, stage: "week" }]);
    expect(selectDueReminders([a], new Set(), new Set([reminderLogKey(a.key, "week")]))).toEqual([]);
  });

  it("does not catch up on stages that already passed", () => {
    // "start" was never sent (e.g. the job didn't run), but the alert is now in its last day
    const a = alert(1);
    expect(selectDueReminders([a], new Set(), new Set())).toEqual([{ alert: a, stage: "day" }]);
  });

  it("moves on to the next stage after an earlier one was sent", () => {
    const a = alert(-2);
    const sent = new Set([reminderLogKey(a.key, "start"), reminderLogKey(a.key, "week"), reminderLogKey(a.key, "day")]);
    expect(selectDueReminders([a], new Set(), sent)).toEqual([{ alert: a, stage: "overdue" }]);
  });

  it("skips dismissed alerts", () => {
    const a = alert(3);
    expect(selectDueReminders([a], new Set([a.key]), new Set())).toEqual([]);
  });
});
