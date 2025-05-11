"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/molecules/Card";
import { Badge } from "@/components/core/atoms/Badge";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { OilPrediction } from "@vefy/shared";
import { formatNumber } from "@/lib/utils";
import { Brain, TrendingUp } from "lucide-react";

interface OilPredictionCardProps {
  prediction: OilPrediction | null;
  oilCycleKm: number;
}

export function OilPredictionCard({ prediction, oilCycleKm }: OilPredictionCardProps) {
  const { t, locale } = useT();

  if (!prediction) return null;

  const urgencyConfig = {
    overdue: { variant: "danger" as const, label: t("prediction.overdueAlert") },
    warning: { variant: "warning" as const, label: t("prediction.remainingDays", { days: prediction.effectiveDaysRemaining ?? 0 }) },
    ok: { variant: "success" as const, label: t("prediction.remainingDaysMore", { days: prediction.effectiveDaysRemaining ?? 0 }) },
  };

  const config = urgencyConfig[prediction.urgency];

  const progressPercent = Math.min(100, ((prediction.kmSinceLast || 0) / oilCycleKm) * 100);
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
            <Brain className="h-3.5 w-3.5 text-primary" />
          </div>
          {t("prediction.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("prediction.daysSinceLast", { days: prediction.daysSinceLast })}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("prediction.lastOdo")}</span>
          <span className="text-foreground">{formatNumber(prediction.lastOdo, locale)} km</span>
        </div>

        {prediction.avgKmPerDay !== null && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("prediction.average")}</span>
              <span className="flex items-center gap-1 text-foreground">
                <TrendingUp className="h-3 w-3 text-primary" />
                {t("prediction.kmPerDay", { km: prediction.avgKmPerDay })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("prediction.estimatedCurrent")}</span>
              <span className="text-foreground">~{formatNumber(prediction.estimatedOdo!, locale)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("prediction.traveled")}</span>
              <span className="text-foreground">
                ~{formatNumber(prediction.kmSinceLast!, locale)} / {formatNumber(oilCycleKm, locale)} km
              </span>
            </div>

            <div className="w-full rounded-full h-2 bg-border overflow-hidden">
              <div
                className={cn("h-2 rounded-full transition-all duration-500", progressColor)}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-faint">
              <span>{t("prediction.byKm", { days: prediction.daysUntilByKm ?? 0 })}</span>
              {prediction.daysUntilByTime !== null && (
                <span>{t("prediction.byTime", { days: prediction.daysUntilByTime })}</span>
              )}
            </div>
          </>
        )}

        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="font-medium text-foreground">{t("prediction.result")}</span>
          {prediction.effectiveDaysRemaining !== null ? (
            <Badge variant={config.variant}>{config.label}</Badge>
          ) : (
            <span className="text-xs text-faint">{t("prediction.hint")}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
