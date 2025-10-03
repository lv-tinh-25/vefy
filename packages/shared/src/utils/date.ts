// Calendar dates ("YYYY-MM-DD") are interpreted in the app's market timezone, so server (UTC on
// Vercel) and browser agree on what "today" is
export const APP_TIME_ZONE = "Asia/Ho_Chi_Minh";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function todayDateStr(now: Date = new Date()): string {
  return dateFormatter.format(now);
}

function toUtcMs(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function daysBetweenDates(from: string, to: string): number {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / MS_PER_DAY);
}

export function daysUntil(dateStr: string, now: Date = new Date()): number {
  return daysBetweenDates(todayDateStr(now), dateStr);
}

// Clamps to month end: 2026-01-31 + 1 month = 2026-02-28
export function addMonthsToDate(dateStr: string, months: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(d, lastDay));
  return target.toISOString().slice(0, 10);
}
