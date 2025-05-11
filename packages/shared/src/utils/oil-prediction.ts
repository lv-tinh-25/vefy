import type { OilChange } from "../schemas/oil-change";
import type { Alert, AlertStatus } from "./alerts";
import { buildAlertKey } from "./alerts";
import { ALERT_THRESHOLDS } from "../constants/defaults";

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

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.floor((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
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
  const todayStr = toDateStr(currentDate);

  const daysSinceLast = Math.max(0, daysBetween(newest.date, todayStr));

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

  // Bước 1: Tính trung bình km/ngày
  const totalKm = newest.odometer - oldest.odometer;
  const totalDays = daysBetween(oldest.date, newest.date);

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

  // Bước 2: Ước tính odometer hiện tại
  const estimatedOdo = newest.odometer + Math.round(avgKmPerDay * daysSinceLast);
  const kmSinceLast = Math.max(0, estimatedOdo - newest.odometer);

  // Bước 3: Số ngày còn lại theo KM
  const kmRemaining = Math.max(0, oilCycleKm - kmSinceLast);
  const daysUntilByKm = Math.round(kmRemaining / avgKmPerDay);

  // Bước 4: Số ngày còn lại theo THỜI GIAN
  let daysUntilByTime: number | null = null;
  if (oilUseDays) {
    daysUntilByTime = Math.max(0, oilCycleDays - daysSinceLast);
  }

  // Bước 5: Kết quả cuối cùng
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
  let label: string;

  if (prediction.effectiveDaysRemaining === null) {
    if (prediction.daysSinceLast > 0) {
      return {
        type: "oil_change",
        status: "neutral",
        label: `Nhớt: đã ${prediction.daysSinceLast} ngày từ lần cuối`,
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
      label = "ĐÃ QUÁ HẠN THAY NHỚT!";
      break;
    case "warning":
      status = "warning";
      label = `Nhớt: còn ~${prediction.effectiveDaysRemaining} ngày`;
      break;
    default:
      status = "success";
      label = `Nhớt: còn ~${prediction.effectiveDaysRemaining} ngày nữa`;
  }

  return {
    type: "oil_change",
    status,
    label,
    daysRemaining: prediction.effectiveDaysRemaining,
    expiryDate: null,
    vehicleId,
    key,
  };
}
