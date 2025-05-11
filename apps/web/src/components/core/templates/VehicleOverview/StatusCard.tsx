"use client";

import { Card, CardContent } from "@/components/core/molecules/Card";
import { Badge } from "@/components/core/atoms/Badge";
import { useT } from "@/lib/i18n";
import { cn, formatDate } from "@/lib/utils";
import type { AlertStatus } from "@vefy/shared";

const statusStyles: Record<AlertStatus, string> = {
  danger: "border-danger/20 bg-danger-muted",
  warning: "border-warning/20 bg-warning-muted",
  success: "border-success/20 bg-success-muted",
  neutral: "border-border bg-surface",
};

const iconColors: Record<AlertStatus, string> = {
  danger: "text-danger",
  warning: "text-warning",
  success: "text-success",
  neutral: "text-muted-foreground",
};

interface StatusCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  expiryDate: string | null;
  daysRemaining: number | null;
  status: AlertStatus;
}

export function StatusCard({ icon: Icon, title, expiryDate, daysRemaining, status }: StatusCardProps) {
  const { t, locale } = useT();

  const badgeVariant: Record<AlertStatus, "danger" | "warning" | "success" | "neutral"> = {
    danger: "danger",
    warning: "warning",
    success: "success",
    neutral: "neutral",
  };

  return (
    <Card className={statusStyles[status]}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={cn("h-4 w-4", iconColors[status])} />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {expiryDate ? formatDate(expiryDate, locale) : t("common.notUpdated")}
          </span>
          <Badge variant={badgeVariant[status]}>
            {daysRemaining === null
              ? t("common.notUpdated")
              : daysRemaining < 0
              ? t("alerts.expiredDays", { days: Math.abs(daysRemaining) })
              : t("alerts.remainingDays", { days: daysRemaining })}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
