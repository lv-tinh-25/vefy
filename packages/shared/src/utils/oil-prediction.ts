import type { OilChange } from "../schemas/oil-change";
import type { OilKind, OilSetting } from "../constants/oil";
import type { Alert, AlertStatus } from "./alerts";
import { buildAlertKey } from "./alerts";
import { ALERT_THRESHOLDS } from "../constants/defaults";
import { daysBetweenDates, todayDateStr } from "./date";

export type OilUrgency = "overdue" | "warning" | "ok";

export interface OilPrediction {
  kind: OilKind;
  cycleKm: number;
  daysSinceLast: number;
  lastOdo: number;
  lastDate: string;
  avgKmPerDay: number | null;
  estimatedOdo: number | null;
  kmSinceLast: number | null;
  daysUntilByKm: number | null;
  daysUntilByTime: number | null;
  effectiveDaysRemaining: number | null;
  urgency: OilUrgency;
}

function byDateAsc(a: OilChange, b: OilChange) {
  return a.date.localeCompare(b.date) || a.odometer - b.odometer;
}

/**
 * Average km/day across every oil change of the vehicle, whatever the kind: the vehicle drives the
 * same distance regardless of which fluid was changed, and rarely changed fluids (60,000 km) would
 * otherwise never have two records to measure from.
 */
export function computeAvgKmPerDay(oilChanges: OilChange[]): number | null {
  if (oilChanges.length < 2) return null;
  const sorted = [...oilChanges].sort(byDateAsc);
  const oldest = sorted[0];
  const newest = sorted[sorted.length - 1];
  const totalKm = newest.odometer - oldest.odometer;
  const totalDays = daysBetweenDates(oldest.date, newest.date);
  if (totalDays <= 0 || totalKm <= 0) return null;
  return totalKm / totalDays;
}

export function predictOilChange(
  kindChanges: OilChange[],
  setting: OilSetting,
  avgKmPerDay: number | null,
  currentDate: Date,
): OilPrediction | null {
  if (kindChanges.length === 0) return null;

  const sorted = [...kindChanges].sort(byDateAsc);
  const newest = sorted[sorted.length - 1];
  const daysSinceLast = Math.max(0, daysBetweenDates(newest.date, todayDateStr(currentDate)));

  let estimatedOdo: number | null = null;
  let kmSinceLast: number | null = null;
  let daysUntilByKm: number | null = null;
  if (avgKmPerDay !== null) {
    estimatedOdo = newest.odometer + Math.round(avgKmPerDay * daysSinceLast);
    kmSinceLast = Math.max(0, estimatedOdo - newest.odometer);
    daysUntilByKm = Math.round(Math.max(0, setting.cycleKm - kmSinceLast) / avgKmPerDay);
  }

  const daysUntilByTime = setting.useDays
    ? Math.max(0, setting.cycleDays - daysSinceLast)
    : null;

  const limits = [daysUntilByKm, daysUntilByTime].filter((d): d is number => d !== null);
  const effectiveDaysRemaining = limits.length > 0 ? Math.min(...limits) : null;

  let urgency: OilUrgency = "ok";
  if (effectiveDaysRemaining !== null) {
    if (effectiveDaysRemaining <= 0) urgency = "overdue";
    else if (effectiveDaysRemaining <= ALERT_THRESHOLDS.oil.warningDays) urgency = "warning";
  }

  return {
    kind: setting.kind,
    cycleKm: setting.cycleKm,
    daysSinceLast,
    lastOdo: newest.odometer,
    lastDate: newest.date,
    avgKmPerDay: avgKmPerDay === null ? null : Math.round(avgKmPerDay * 10) / 10,
    estimatedOdo,
    kmSinceLast,
    daysUntilByKm,
    daysUntilByTime,
    effectiveDaysRemaining,
    urgency,
  };
}

/** One prediction per enabled kind that has at least one record, in settings order. */
export function predictOilChanges(
  oilChanges: OilChange[],
  settings: OilSetting[],
  currentDate: Date,
): OilPrediction[] {
  const avgKmPerDay = computeAvgKmPerDay(oilChanges);
  return settings
    .filter((s) => s.enabled)
    .map((s) =>
      predictOilChange(
        oilChanges.filter((oc) => oc.kind === s.kind),
        s,
        avgKmPerDay,
        currentDate,
      ),
    )
    .filter((p): p is OilPrediction => p !== null);
}

export function oilPredictionToAlert(
  prediction: OilPrediction,
  vehicleId: string,
): Alert | null {
  // Engine oil keeps the pre-kinds key format so alerts dismissed before stay dismissed
  const discriminator =
    prediction.kind === "engine" ? prediction.lastDate : `${prediction.kind}:${prediction.lastDate}`;
  const key = buildAlertKey("oil_change", vehicleId, discriminator);
  const base = { type: "oil_change" as const, oilKind: prediction.kind, expiryDate: null, vehicleId, key };

  if (prediction.effectiveDaysRemaining === null) {
    if (prediction.daysSinceLast > 0) {
      return {
        ...base,
        status: "neutral",
        daysSinceLast: prediction.daysSinceLast,
        daysRemaining: null,
      };
    }
    return null;
  }

  const statusByUrgency: Record<OilUrgency, AlertStatus> = {
    overdue: "danger",
    warning: "warning",
    ok: "success",
  };

  return {
    ...base,
    status: statusByUrgency[prediction.urgency],
    daysRemaining: prediction.effectiveDaysRemaining,
  };
}
