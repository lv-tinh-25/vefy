import type { Alert } from "@vefy/shared";
import type { MessageKey } from "@/lib/i18n";

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

export function getAlertLabel(alert: Alert, t: Translate): string {
  switch (alert.type) {
    case "warranty":
      return t("alerts.labelWarranty");
    case "registration":
      return t("alerts.labelRegistration");
    case "insurance":
      return t("alerts.labelInsurance");
    case "part_warranty":
      return t("alerts.labelPartWarranty", { name: alert.subject ?? "" });
    case "oil_change": {
      const kind = t(`oilKinds.${alert.oilKind ?? "engine"}`);
      if (alert.daysRemaining === null) {
        const days = alert.daysSinceLast ?? 0;
        return t(days === 1 ? "alerts.labelOilYesterday" : "alerts.labelOilSinceLast", { kind, days });
      }
      if (alert.status === "danger") return t("alerts.labelOilOverdue", { kind });
      return t("alerts.labelOilRemaining", { kind, days: alert.daysRemaining });
    }
  }
}
