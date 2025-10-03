"use client";

import type { Alert } from "@vefy/shared";
import { AlertBadge } from "@/components/core/molecules/AlertBadge";
import { useT } from "@/lib/i18n";
import { getAlertLabel } from "@/lib/alert-label";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface AlertListProps {
  alerts: Alert[];
}

export function AlertList({ alerts }: AlertListProps) {
  const { t } = useT();
  const active = alerts.filter((a) => a.status === "danger" || a.status === "warning");

  if (active.length === 0) {
    return (
      <div className="flex items-center gap-2 text-success py-4">
        <CheckCircle className="h-5 w-5" />
        <span className="text-sm font-medium">{t("alerts.allGood")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {active.map((alert, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2.5"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={cn("h-4 w-4", alert.status === "danger" ? "text-danger" : "text-warning")}
            />
            <span className="text-sm text-foreground">{getAlertLabel(alert, t)}</span>
          </div>
          <div className="flex items-center gap-2">
            {alert.daysRemaining !== null && (
              <span className="text-xs text-muted-foreground">
                {alert.daysRemaining < 0
                  ? t("alerts.expiredDays", { days: Math.abs(alert.daysRemaining) })
                  : t("alerts.remainingDays", { days: alert.daysRemaining })}
              </span>
            )}
            <AlertBadge status={alert.status} />
          </div>
        </div>
      ))}
    </div>
  );
}
