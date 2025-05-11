import type { Vehicle } from "../schemas/vehicle";
import type { Part } from "../schemas/part";
import { ALERT_THRESHOLDS } from "../constants/defaults";

export type AlertStatus = "danger" | "warning" | "success" | "neutral";

export type AlertType = "warranty" | "registration" | "insurance" | "part_warranty" | "oil_change";

export interface Alert {
  type: AlertType;
  status: AlertStatus;
  label: string;
  daysRemaining: number | null;
  expiryDate: string | null;
  vehicleId: string;
  key: string;
  relatedId?: string;
}

export function buildAlertKey(
  type: AlertType,
  entityId: string,
  discriminator: string | null,
): string {
  return `${type}:${entityId}:${discriminator ?? "none"}`;
}

function daysBetween(dateStr: string, now: Date): number {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function dateAlert(
  type: AlertType,
  label: string,
  expiryDate: string | null,
  now: Date,
  vehicleId: string,
  threshold = ALERT_THRESHOLDS.document,
): Alert {
  if (!expiryDate) {
    return {
      type,
      status: "neutral",
      label,
      daysRemaining: null,
      expiryDate: null,
      vehicleId,
      key: buildAlertKey(type, vehicleId, null),
    };
  }

  const days = daysBetween(expiryDate, now);
  let status: AlertStatus;

  if (days < threshold.dangerDays) {
    status = "danger";
  } else if (days <= threshold.warningDays) {
    status = "warning";
  } else {
    status = "success";
  }

  return {
    type,
    status,
    label,
    daysRemaining: days,
    expiryDate,
    vehicleId,
    key: buildAlertKey(type, vehicleId, expiryDate),
  };
}

export function computeDocumentAlerts(vehicle: Vehicle, now: Date): Alert[] {
  const alerts: Alert[] = [];

  alerts.push(dateAlert("warranty", "Bảo hành xe", vehicle.warrantyExpiry, now, vehicle.id));

  if (vehicle.type === "car") {
    alerts.push(
      dateAlert("registration", "Đăng kiểm", vehicle.registrationExpiry, now, vehicle.id),
    );
  }

  alerts.push(dateAlert("insurance", "Bảo hiểm", vehicle.insuranceExpiry, now, vehicle.id));

  return alerts;
}

export function computePartAlerts(parts: Part[], now: Date, vehicleId: string): Alert[] {
  return parts.map((part) => {
    const base = dateAlert(
      "part_warranty",
      `BH: ${part.name}`,
      part.warrantyExpiry,
      now,
      vehicleId,
      ALERT_THRESHOLDS.partWarranty,
    );
    return {
      ...base,
      key: buildAlertKey("part_warranty", part.id, part.warrantyExpiry),
      relatedId: part.id,
    };
  });
}

export function computeAllAlerts(
  vehicle: Vehicle,
  parts: Part[],
  oilAlert: Alert | null,
  now: Date,
): Alert[] {
  const alerts: Alert[] = [
    ...computeDocumentAlerts(vehicle, now),
    ...computePartAlerts(parts, now, vehicle.id),
  ];

  if (oilAlert) {
    alerts.push(oilAlert);
  }

  return alerts;
}

export function getActiveAlerts(alerts: Alert[]): Alert[] {
  return alerts.filter((a) => a.status === "danger" || a.status === "warning");
}

export function countAlertsByStatus(alerts: Alert[]): Record<AlertStatus, number> {
  const counts: Record<AlertStatus, number> = {
    danger: 0,
    warning: 0,
    success: 0,
    neutral: 0,
  };
  for (const a of alerts) {
    counts[a.status]++;
  }
  return counts;
}
