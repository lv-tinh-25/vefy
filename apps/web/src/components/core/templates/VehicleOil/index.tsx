"use client";

import { useParams } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/molecules/Card";
import { Button } from "@/components/core/atoms/Button";
import { InputNumber } from "@/components/core/atoms/InputNumber";
import { Label } from "@/components/core/atoms/Label";
import { OilPredictionCard } from "@/components/core/templates/VehicleOverview/OilPredictionCard";
import { OilChangeFormModal } from "./OilChangeFormModal";
import { ConfirmDialog } from "@/components/core/molecules/ConfirmDialog";
import { useOilChanges } from "@/hooks/vehicles/useOilChanges";
import { useT } from "@/lib/i18n";
import { formatDate, formatNumber } from "@/lib/utils";
import { PageSpinner } from "@/components/core/atoms/Spinner";
import { Plus, Trash2, Settings2 } from "lucide-react";

interface OilSettingsFormValues {
  oilCycleKm: number;
  oilUseDays: boolean;
  oilCycleDays: number | undefined;
}

export function VehicleOilContent() {
  const params = useParams();
  const vehicleId = String(params.id);
  const { t, locale } = useT();
  const {
    vehicle, showForm, setShowForm, deleteId, setDeleteId,
    deleting, savingSettings, deleteOilChange, saveSettings, mutate,
  } = useOilChanges(vehicleId);

  const settingsForm = useForm<OilSettingsFormValues>({
    values: vehicle
      ? {
          oilCycleKm: vehicle.oilCycleKm,
          oilUseDays: vehicle.oilUseDays,
          oilCycleDays: vehicle.oilCycleDays ?? undefined,
        }
      : undefined,
  });

  const useDays = useWatch({ control: settingsForm.control, name: "oilUseDays" });

  if (!vehicle) return <PageSpinner />;

  const handleSaveSettings = settingsForm.handleSubmit((data) => {
    saveSettings({
      oilCycleKm: data.oilCycleKm,
      oilUseDays: data.oilUseDays,
      oilCycleDays: data.oilUseDays ? data.oilCycleDays || undefined : undefined,
    });
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            {t("oil.cycleSettings")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-3">
            <div>
              <Label>{t("oil.cycleKm")}</Label>
              <InputNumber
                control={settingsForm.control}
                name="oilCycleKm"
                thousandSeparator
                suffix="km"
                className="mt-1.5"
              />
            </div>
            <div className="flex items-center gap-2">
              <Controller
                control={settingsForm.control}
                name="oilUseDays"
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-surface accent-primary"
                  />
                )}
              />
              <Label>{t("oil.useTimeLimit")}</Label>
            </div>
            {useDays && (
              <div>
                <Label>{t("oil.cycleDays")}</Label>
                <InputNumber
                  control={settingsForm.control}
                  name="oilCycleDays"
                  suffix={t("common.days")}
                  className="mt-1.5"
                />
              </div>
            )}
            <Button type="submit" size="sm" variant="outline" disabled={savingSettings}>
              {savingSettings ? t("common.saving") : t("common.saveSettings")}
            </Button>
          </form>
        </CardContent>
      </Card>

      <OilPredictionCard prediction={vehicle.oilPrediction} oilCycleKm={vehicle.oilCycleKm} />

      <Button onClick={() => setShowForm(true)} className="w-full">
        <Plus className="h-4 w-4" />
        {t("oil.addOilChange")}
      </Button>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">{t("oil.history")}</h3>
        {vehicle.oilChanges.length === 0 ? (
          <p className="text-sm text-faint text-center py-8">{t("oil.noHistory")}</p>
        ) : (
          <div className="space-y-2">
            {vehicle.oilChanges.map((oc) => (
              <Card key={oc.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{formatDate(oc.date, locale)}</span>
                      <span className="text-xs text-muted-foreground">{formatNumber(oc.odometer, locale)} km</span>
                    </div>
                    {(oc.oilType || oc.note) && (
                      <p className="text-xs text-faint mt-0.5">{[oc.oilType, oc.note].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteId(oc.id)} className="text-faint hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showForm && <OilChangeFormModal open onClose={() => setShowForm(false)} onSuccess={() => mutate()} vehicleId={vehicleId} />}

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
