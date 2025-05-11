"use client";

import { Badge } from "@/components/core/atoms/Badge";
import { useT } from "@/lib/i18n";
import type { AlertStatus } from "@vefy/shared";

interface AlertBadgeProps {
  status: AlertStatus;
  label?: string;
}

export function AlertBadge({ status, label }: AlertBadgeProps) {
  const { t } = useT();

  const statusMap: Record<AlertStatus, { variant: "danger" | "warning" | "success" | "neutral"; labelKey: string }> = {
    danger: { variant: "danger", labelKey: t("alerts.overdue") },
    warning: { variant: "warning", labelKey: t("alerts.nearExpiry") },
    success: { variant: "success", labelKey: t("alerts.valid") },
    neutral: { variant: "neutral", labelKey: t("common.notUpdated") },
  };

  const config = statusMap[status];
  return <Badge variant={config.variant}>{label || config.labelKey}</Badge>;
}
