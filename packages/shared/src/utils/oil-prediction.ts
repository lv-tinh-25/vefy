import type { OilChange } from "../schemas/oil-change";
import type { Alert, AlertStatus } from "./alerts";
import { buildAlertKey } from "./alerts";
import { ALERT_THRESHOLDS } from "../constants/defaults";
import { daysBetweenDates, todayDateStr } from "./date";

export type OilUrgency = "overdue" | "warning" | "ok";

export interface OilPrediction {
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


export function predictOilChange(
  oilChanges: OilChange[],
  oilCycleKm: number,
  oilUseDays: boolean,
  oilCycleDays: number,
  currentDate: Date,
): OilPrediction | null {
  if (oilChanges.length === 0) return null;

  const sorted = [...oilChanges].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const newest = sorted[sorted.length - 1];
  const oldest = sorted[0];
  const todayStr = todayDateStr(currentDate);

  const daysSinceLast = Math.max(0, daysBetweenDates(newest.date, todayStr));

  if (sorted.length < 2) {
    return {
      daysSinceLast,
      lastOdo: newest.odometer,
      lastDate: newest.date,
      avgKmPerDay: null,
      estimatedOdo: null,
      kmSinceLast: null,
      daysUntilByKm: null,
      daysUntilByTime: null,
      effectiveDaysRemaining: null,
      urgency: "ok",
    };
  }

  // 1. Average km/day across the full history
  const totalKm = newest.odometer - oldest.odometer;
  const totalDays = daysBetweenDates(oldest.date, newest.date);

  if (totalDays <= 0 || totalKm <= 0) {
    return {
      daysSinceLast,
      lastOdo: newest.odometer,
      lastDate: newest.date,
      avgKmPerDay: null,
      estimatedOdo: null,
      kmSinceLast: null,
      daysUntilByKm: null,
      daysUntilByTime: null,
      effectiveDaysRemaining: null,
      urgency: "ok",
    };
  }

  const avgKmPerDay = totalKm / totalDays;

  // 2. Estimate the current odometer
  const estimatedOdo = newest.odometer + Math.round(avgKmPerDay * daysSinceLast);
  const kmSinceLast = Math.max(0, estimatedOdo - newest.odometer);

  // 3. Days left by distance
  const kmRemaining = Math.max(0, oilCycleKm - kmSinceLast);
  const daysUntilByKm = Math.round(kmRemaining / avgKmPerDay);

  // 4. Days left by time
  let daysUntilByTime: number | null = null;
  if (oilUseDays) {
    daysUntilByTime = Math.max(0, oilCycleDays - daysSinceLast);
  }

  // 5. Whichever limit comes first
  let effectiveDaysRemaining: number | null;
  if (daysUntilByTime !== null) {
    effectiveDaysRemaining = Math.min(daysUntilByKm, daysUntilByTime);
  } else {
    effectiveDaysRemaining = daysUntilByKm;
  }

  let urgency: OilUrgency;
  if (effectiveDaysRemaining <= 0) {
    urgency = "overdue";
  } else if (effectiveDaysRemaining <= ALERT_THRESHOLDS.oil.warningDays) {
    urgency = "warning";
  } else {
    urgency = "ok";
  }

  return {
    daysSinceLast,
    lastOdo: newest.odometer,
    lastDate: newest.date,
    avgKmPerDay: Math.round(avgKmPerDay * 10) / 10,
    estimatedOdo,
    kmSinceLast,
    daysUntilByKm,
    daysUntilByTime,
    effectiveDaysRemaining,
    urgency,
  };
}

export function oilPredictionToAlert(
  prediction: OilPrediction | null,
  vehicleId: string,
): Alert | null {
  if (!prediction) return null;

  const key = buildAlertKey("oil_change", vehicleId, prediction.lastDate);

  let status: AlertStatus;

  if (prediction.effectiveDaysRemaining === null) {
    if (prediction.daysSinceLast > 0) {
      return {
        type: "oil_change",
        status: "neutral",
        daysSinceLast: prediction.daysSinceLast,
        daysRemaining: null,
        expiryDate: null,
        vehicleId,
        key,
      };
    }
    return null;
  }

  switch (prediction.urgency) {
    case "overdue":
      status = "danger";
      break;
    case "warning":
      status = "warning";
      break;
    default:
      status = "success";
  }

  return {
    type: "oil_change",
    status,
    daysRemaining: prediction.effectiveDaysRemaining,
    expiryDate: null,
    vehicleId,
    key,
  };
}
