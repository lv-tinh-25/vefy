import { daysBetweenDates, todayDateStr } from "@vefy/shared";

/** Readings this recent are prefilled; older ones are only offered as a hint */
const PREFILL_WITHIN_DAYS = 7;

export interface LastOdometer {
  odometer: number;
  date: string;
  prefill: boolean;
}

/** Newest odometer reading across the vehicle's oil changes and parts */
export function getLastOdometer(
  oilChanges: { date: string; odometer: number }[],
  parts: { installDate: string; odometer: number | null }[],
): LastOdometer | null {
  const readings = [
    ...oilChanges.map((oc) => ({ date: oc.date, odometer: oc.odometer })),
    ...parts.flatMap((p) => (p.odometer === null ? [] : [{ date: p.installDate, odometer: p.odometer }])),
  ];
  if (readings.length === 0) return null;

  const latest = readings.reduce((a, b) =>
    b.date > a.date || (b.date === a.date && b.odometer > a.odometer) ? b : a,
  );
  return {
    ...latest,
    prefill: daysBetweenDates(latest.date, todayDateStr()) <= PREFILL_WITHIN_DAYS,
  };
}
