import { describe, expect, it } from "vitest";
import { addMonthsToDate, daysBetweenDates, daysUntil, todayDateStr } from "../utils/date";

describe("todayDateStr", () => {
  it("uses the Vietnam calendar day, not UTC", () => {
    expect(todayDateStr(new Date("2026-10-03T16:59:00Z"))).toBe("2026-10-03");
    expect(todayDateStr(new Date("2026-10-03T17:00:00Z"))).toBe("2026-10-04");
  });
});

describe("daysBetweenDates / daysUntil", () => {
  it("counts whole calendar days", () => {
    expect(daysBetweenDates("2026-10-03", "2027-10-03")).toBe(365);
    expect(daysBetweenDates("2026-10-05", "2026-10-03")).toBe(-2);
  });

  it("ignores the time of day", () => {
    expect(daysUntil("2026-10-03", new Date("2026-10-03T09:45:00Z"))).toBe(0);
    expect(daysUntil("2027-10-03", new Date("2026-10-03T09:45:00Z"))).toBe(365);
  });
});

describe("addMonthsToDate", () => {
  it("adds months and rolls over years", () => {
    expect(addMonthsToDate("2026-10-03", 12)).toBe("2027-10-03");
    expect(addMonthsToDate("2026-11-15", 3)).toBe("2027-02-15");
  });

  it("clamps to the end of shorter months", () => {
    expect(addMonthsToDate("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonthsToDate("2024-01-31", 1)).toBe("2024-02-29");
  });
});
