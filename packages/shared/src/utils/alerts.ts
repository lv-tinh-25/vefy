import type { Vehicle } from "../schemas/vehicle";
import type { Part } from "../schemas/part";
import { ALERT_THRESHOLDS } from "../constants/defaults";
import { daysUntil } from "./date";

export type AlertStatus = "danger" | "warning" | "success" | "neutral";

export type AlertType = "warranty" | "registration" | "insurance" | "part_warranty" | "oil_change";

export interface Alert {
  type: AlertType;
  status: AlertStatus;
  /** Part name for part_warranty alerts; display text is built by the client via i18n */
  subject?: string;
  /** Days since the last oil change, for oil alerts without a prediction yet */
  daysSinceLast?: number;
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

function dateAlert(
  type: AlertType,
  expiryDate: string | null,
  now: Date,
  vehicleId: string,
  threshold = ALERT_THRESHOLDS.document,
): Alert {
  if (!expiryDate) {
    return {
      type,
      status: "neutral",
      daysRemaining: null,
      expiryDate: null,
      vehicleId,
      key: buildAlertKey(type, vehicleId, null),
    };
  }

  const days = daysUntil(expiryDate, now);
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
    daysRemaining: days,
    expiryDate,
    vehicleId,
    key: buildAlertKey(type, vehicleId, expiryDate),
  };
}

export function computeDocumentAlerts(vehicle: Vehicle, now: Date): Alert[] {
  const alerts: Alert[] = [];

  alerts.push(dateAlert("warranty", vehicle.warrantyExpiry, now, vehicle.id));

  if (vehicle.type === "car") {
    alerts.push(
      dateAlert("registration", vehicle.registrationExpiry, now, vehicle.id),
    );
  }

  alerts.push(dateAlert("insurance", vehicle.insuranceExpiry, now, vehicle.id));

  return alerts;
}

export function computePartAlerts(parts: Part[], now: Date, vehicleId: string): Alert[] {
  return parts.map((part) => {
    const base = dateAlert(
      "part_warranty",
      part.warrantyExpiry,
      now,
      vehicleId,
      ALERT_THRESHOLDS.partWarranty,
    );
    return {
      ...base,
      key: buildAlertKey("part_warranty", part.id, part.warrantyExpiry),
      relatedId: part.id,
      subject: part.name,
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
