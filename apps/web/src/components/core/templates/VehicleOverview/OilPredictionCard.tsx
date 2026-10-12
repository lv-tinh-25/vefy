"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/molecules/Card";
import { Badge } from "@/components/core/atoms/Badge";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { formatDaysAgo, OIL_CHANGED_KEYS } from "@/lib/days-ago";
import type { MessageKey } from "@/lib/i18n";
import type { OilPrediction } from "@vefy/shared";
import { formatNumber } from "@/lib/utils";
import { Droplets } from "lucide-react";

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

export function getPredictionBadge(prediction: OilPrediction, t: Translate) {
  const days = prediction.effectiveDaysRemaining;
  if (days === null) return null;
  if (prediction.urgency === "overdue") return { variant: "danger" as const, label: t("prediction.overdueAlert") };
  if (prediction.urgency === "warning") return { variant: "warning" as const, label: t("prediction.remainingDays", { days }) };
  return { variant: "success" as const, label: t("prediction.remainingDaysMore", { days }) };
}

export function OilPredictionCard({ prediction }: { prediction: OilPrediction }) {
  const { t, locale } = useT();
  const badge = getPredictionBadge(prediction, t);

  const progressPercent = Math.min(100, ((prediction.kmSinceLast || 0) / prediction.cycleKm) * 100);
  const progressColor =
    prediction.urgency === "overdue"
      ? "bg-danger"
      : prediction.urgency === "warning"
      ? "bg-warning"
      : "bg-success";

  return (
    <Card className="border-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-muted">
            <Droplets className="h-3.5 w-3.5 text-primary" />
          </div>
          {t(`oilKinds.${prediction.kind}`)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{formatDaysAgo(prediction.daysSinceLast, t, OIL_CHANGED_KEYS)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("prediction.lastOdo")}</span>
          <span className="text-foreground">{formatNumber(prediction.lastOdo, locale)} km</span>
        </div>

        {prediction.kmSinceLast !== null && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("prediction.traveled")}</span>
              <span className="text-foreground">
                ~{formatNumber(prediction.kmSinceLast, locale)} / {formatNumber(prediction.cycleKm, locale)} km
              </span>
            </div>

            <div className="w-full rounded-full h-2 bg-border overflow-hidden">
              <div
                className={cn("h-2 rounded-full transition-all duration-500", progressColor)}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </>
        )}

        {(prediction.daysUntilByKm !== null || prediction.daysUntilByTime !== null) && (
          <div className="flex justify-between text-xs text-faint">
            {prediction.daysUntilByKm !== null && (
              <span>{t("prediction.byKm", { days: prediction.daysUntilByKm })}</span>
            )}
            {prediction.daysUntilByTime !== null && (
              <span>{t("prediction.byTime", { days: prediction.daysUntilByTime })}</span>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
          <span className="font-medium text-foreground">{t("prediction.result")}</span>
          {badge ? (
            <Badge variant={badge.variant}>{badge.label}</Badge>
          ) : (
            <span className="text-xs text-faint text-right">{t("prediction.hint")}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
