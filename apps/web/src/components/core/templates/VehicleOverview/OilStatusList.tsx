"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/core/molecules/Card";
import { Badge } from "@/components/core/atoms/Badge";
import { useT } from "@/lib/i18n";
import type { OilPrediction, OilSetting } from "@vefy/shared";
import { getPredictionBadge } from "./OilPredictionCard";
import { ChevronRight } from "lucide-react";

interface OilStatusListProps {
  vehicleId: string;
  settings: OilSetting[];
  predictions: OilPrediction[];
}

/** One row per enabled kind, the most urgent first; details live on the Oil tab */
export function OilStatusList({ vehicleId, settings, predictions }: OilStatusListProps) {
  const { t } = useT();

  const rows = settings
    .filter((s) => s.enabled)
    .map((s) => ({ kind: s.kind, prediction: predictions.find((p) => p.kind === s.kind) }))
    .sort(
      (a, b) =>
        (a.prediction?.effectiveDaysRemaining ?? Infinity) -
        (b.prediction?.effectiveDaysRemaining ?? Infinity),
    );

  if (rows.length === 0) return null;

  return (
    <Link href={`/vehicle/${vehicleId}/oil`}>
      <Card className="hover:border-primary/20 transition-colors">
        <CardContent className="p-0 divide-y divide-border">
          {rows.map(({ kind, prediction }) => {
            const badge = prediction ? getPredictionBadge(prediction, t) : null;
            return (
              <div key={kind} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-foreground">{t(`oilKinds.${kind}`)}</span>
                <span className="flex items-center gap-2 min-w-0">
                  {badge ? (
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  ) : (
                    <span className="text-xs text-faint truncate">
                      {prediction
                        ? t("prediction.daysSinceLast", { days: prediction.daysSinceLast })
                        : t("overview.noKindData")}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-faint shrink-0" />
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </Link>
  );
}
