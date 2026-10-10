"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/core/molecules/Card";
import { Button } from "@/components/core/atoms/Button";
import { IconButton } from "@/components/core/atoms/IconButton";
import { RecordItem } from "@/components/core/molecules/RecordItem";
import { OilPredictionCard } from "@/components/core/templates/VehicleOverview/OilPredictionCard";
import { OilChangeFormModal } from "./OilChangeFormModal";
import { OilSettingsCard } from "./OilSettingsCard";
import { ConfirmDialog } from "@/components/core/molecules/ConfirmDialog";
import { useOilChanges } from "@/hooks/vehicles/useOilChanges";
import { getLastOdometer } from "@/lib/last-odometer";
import { useT } from "@/lib/i18n";
import { cn, formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import { PageSpinner } from "@/components/core/atoms/Spinner";
import { daysBetweenDates, todayDateStr, type OilKind } from "@vefy/shared";
import { Plus, Trash2, Droplets, TrendingUp } from "lucide-react";

export function VehicleOilContent() {
  const params = useParams();
  const vehicleId = String(params.id);
  const { t, locale } = useT();
  const {
    vehicle, showForm, setShowForm, deleteId, setDeleteId,
    deleting, savingSettings, deleteOilChange, saveSettings, mutate,
  } = useOilChanges(vehicleId);
  const [filter, setFilter] = useState<OilKind | "all">("all");

  if (!vehicle) return <PageSpinner />;

  if (vehicle.oilSettings.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-faint">{t("oil.electricNoOil")}</CardContent>
      </Card>
    );
  }

  const enabledKinds = vehicle.oilSettings.filter((s) => s.enabled).map((s) => s.kind);
  const avgKmPerDay = vehicle.oilPredictions.find((p) => p.avgKmPerDay !== null)?.avgKmPerDay ?? null;
  const latest = vehicle.oilChanges[0];
  const estimatedOdo =
    avgKmPerDay !== null && latest
      ? latest.odometer + Math.round(avgKmPerDay * Math.max(0, daysBetweenDates(latest.date, todayDateStr())))
      : null;

  const historyKinds = [...new Set(vehicle.oilChanges.map((oc) => oc.kind))];
  const activeFilter = filter !== "all" && historyKinds.includes(filter) ? filter : "all";
  const history =
    activeFilter === "all" ? vehicle.oilChanges : vehicle.oilChanges.filter((oc) => oc.kind === activeFilter);

  const chip = (value: OilKind | "all", label: string) => (
    <button
      key={value}
      type="button"
      onClick={() => setFilter(value)}
      aria-pressed={activeFilter === value}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-xs transition-colors",
        activeFilter === value
          ? "border-primary bg-primary-muted text-primary"
          : "border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <OilSettingsCard settings={vehicle.oilSettings} saving={savingSettings} onSave={saveSettings} />

      {avgKmPerDay !== null && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t("oil.averageKmPerDay", { km: avgKmPerDay })}
          </span>
          {estimatedOdo !== null && <span>{t("oil.estimatedOdo", { km: formatNumber(estimatedOdo, locale) })}</span>}
        </div>
      )}

      {enabledKinds.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {enabledKinds.map((kind) => {
            const prediction = vehicle.oilPredictions.find((p) => p.kind === kind);
            return prediction ? (
              <OilPredictionCard key={kind} prediction={prediction} />
            ) : (
              <Card key={kind}>
                <CardContent className="p-4 flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 font-medium text-foreground">
                    <Droplets className="h-4 w-4 text-muted-foreground" />
                    {t(`oilKinds.${kind}`)}
                  </span>
                  <span className="text-xs text-faint">{t("overview.noKindData")}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Button onClick={() => setShowForm(true)} className="w-full" disabled={enabledKinds.length === 0}>
        <Plus className="h-4 w-4" />
        {t("oil.addOilChange")}
      </Button>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("oil.history")}</h3>
        {historyKinds.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
            {chip("all", t("oil.filterAll"))}
            {historyKinds.map((kind) => chip(kind, t(`oilKinds.${kind}`)))}
          </div>
        )}
        {history.length === 0 ? (
          <p className="text-sm text-faint text-center py-8">{t("oil.noHistory")}</p>
        ) : (
          <div className="space-y-2">
            {history.map((oc) => (
              <RecordItem
                key={oc.id}
                icon={Droplets}
                title={t(`oilKinds.${oc.kind}`)}
                meta={[formatDate(oc.date, locale), `${formatNumber(oc.odometer, locale)} km`]}
                details={[oc.oilType, oc.note]}
                amount={formatCurrency(oc.cost, locale)}
                action={
                  <IconButton icon={Trash2} tone="danger" label={t("common.delete")} onClick={() => setDeleteId(oc.id)} />
                }
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <OilChangeFormModal
          open
          onClose={() => setShowForm(false)}
          onSuccess={() => mutate()}
          vehicleId={vehicleId}
          enabledKinds={enabledKinds}
          lastOdometer={getLastOdometer(vehicle.oilChanges, vehicle.parts)}
        />
      )}

      {deleteId !== null && (
        <ConfirmDialog
          open
          onClose={() => setDeleteId(null)}
          onConfirm={deleteOilChange}
          title={t("oil.deleteTitle")}
          description={t("oil.deleteConfirm")}
          loading={deleting}
        />
      )}
    </div>
  );
}
