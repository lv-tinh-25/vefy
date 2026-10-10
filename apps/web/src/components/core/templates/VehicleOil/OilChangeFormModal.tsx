"use client";

import { Controller } from "react-hook-form";
import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { IconButton } from "@/components/core/atoms/IconButton";
import { Input } from "@/components/core/atoms/Input";
import { InputNumber } from "@/components/core/atoms/InputNumber";
import { Label } from "@/components/core/atoms/Label";
import { Select } from "@/components/core/atoms/Select";
import { OcrButton } from "@/components/core/molecules/OcrButton";
import { useT } from "@/lib/i18n";
import { useOilChangeForm } from "@/hooks/vehicles/useOilChangeForm";
import type { OilKind } from "@vefy/shared";
import type { LastOdometer } from "@/lib/last-odometer";
import { formatDate, formatNumber } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface OilChangeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<unknown> | void;
  vehicleId: string;
  enabledKinds: OilKind[];
  lastOdometer: LastOdometer | null;
}

export function OilChangeFormModal({
  open, onClose, onSuccess, vehicleId, enabledKinds, lastOdometer,
}: OilChangeFormModalProps) {
  const { t, tRaw, locale } = useT();
  const { form, items, removeItem, addItem, canAddItem, kindOptions, loading, error, onSubmit } =
    useOilChangeForm(vehicleId, enabledKinds, lastOdometer?.prefill ? lastOdometer.odometer : undefined, onSuccess, onClose);
  const {
    control,
    setValue,
    formState: { errors },
  } = form;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      busy={loading}
      title={t("oilForm.title")}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>{t("common.cancel")}</Button>
          <Button type="submit" form="oil-change-form" disabled={loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </>
      }
    >
      <form id="oil-change-form" onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            {/* Same height as the odometer label row, which holds the OCR button */}
            <div className="flex h-8 items-center">
              <Label>{t("oilForm.date")} *</Label>
            </div>
            <Controller control={control} name="date" render={({ field, fieldState }) => (
              <>
                <Input type="date" {...field} className="mt-1.5" />
                {fieldState.error && <p className="text-sm text-danger mt-1">{tRaw(fieldState.error.message)}</p>}
              </>
            )} />
          </div>

          <div>
            <div className="flex h-8 items-center justify-between gap-2">
              <Label>{t("oilForm.odometer")} *</Label>
              <OcrButton onResult={(km) => setValue("odometer", km)} />
            </div>
            <InputNumber
              control={control}
              name="odometer"
              placeholder={
                lastOdometer
                  ? t("common.lastOdometerHint", {
                      km: formatNumber(lastOdometer.odometer, locale),
                      date: formatDate(lastOdometer.date, locale),
                    })
                  : t("oilForm.odometerHint")
              }
              thousandSeparator
              suffix="km"
              className="mt-1.5"
            />
            {errors.odometer && (
              <p className="text-sm text-danger mt-1">
                {tRaw(errors.odometer.message as string)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => {
            const itemErrors = errors.items?.[index];
            return (
              <div key={item.id} className="rounded-lg border border-border p-3 space-y-3">
                <div className="flex items-end gap-2">
                  <div className="flex-1 min-w-0">
                    <Label>{t("oilForm.kind")} *</Label>
                    <Controller control={control} name={`items.${index}.kind`} render={({ field }) => (
                      <Select {...field} className="mt-1.5">
                        {kindOptions(index).map((kind) => (
                          <option key={kind} value={kind}>{t(`oilKinds.${kind}`)}</option>
                        ))}
                      </Select>
                    )} />
                  </div>
                  {items.length > 1 && (
                    <IconButton icon={X} label={t("oilForm.removeKind")} onClick={() => removeItem(index)} className="mb-0.5" />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>{t("oilForm.cost")} *</Label>
                    <InputNumber
                      control={control}
                      name={`items.${index}.cost`}
                      thousandSeparator
                      suffix="₫"
                      className="mt-1.5"
                    />
                    {itemErrors?.cost && (
                      <p className="text-sm text-danger mt-1">{tRaw(itemErrors.cost.message as string)}</p>
                    )}
                  </div>
                  <div>
                    <Label>{t("oilForm.oilType")} ({t("common.optional")})</Label>
                    <Controller control={control} name={`items.${index}.oilType`} render={({ field }) => (
                      <Input {...field} value={field.value ?? ""} placeholder={t("oilForm.oilTypeHint")} className="mt-1.5" />
                    )} />
                  </div>
                </div>
              </div>
            );
          })}

          {canAddItem && (
            <Button type="button" variant="outline" size="sm" onClick={addItem} className="w-full">
              <Plus className="h-4 w-4" />
              {t("oilForm.addKind")}
            </Button>
          )}
        </div>

        <div>
          <Label>{t("oilForm.note")} ({t("common.optional")})</Label>
          <Controller control={control} name="note" render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder={t("common.noteHint")} className="mt-1.5" />} />
        </div>

        {error && <p className="text-sm text-danger bg-danger-muted p-3 rounded-lg">{error}</p>}
      </form>
    </Dialog>
  );
}
