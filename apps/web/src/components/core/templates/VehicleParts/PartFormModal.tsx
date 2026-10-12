"use client";

import { useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { Input } from "@/components/core/atoms/Input";
import { InputNumber } from "@/components/core/atoms/InputNumber";
import { Label } from "@/components/core/atoms/Label";
import { AddRowButton, EntryRow } from "@/components/core/molecules/EntryRow";
import { OtherExpenseFields } from "@/components/core/templates/VehicleExpenses/OtherExpenseFields";
import { useT } from "@/lib/i18n";
import { usePartForm } from "@/hooks/vehicles/usePartForm";
import { useOtherExpenseForm } from "@/hooks/vehicles/useOtherExpenseForm";
import type { LastOdometer } from "@/lib/last-odometer";
import { formatDate, formatNumber } from "@/lib/utils";

type FormType = "part" | "other";

interface PartFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<unknown> | void;
  vehicleId: string;
  lastOdometer: LastOdometer | null;
}

export function PartFormModal({ open, onClose, onSuccess, vehicleId, lastOdometer }: PartFormModalProps) {
  const { t, tRaw, locale } = useT();
  const [formType, setFormType] = useState<FormType>("part");
  const partForm = usePartForm(
    vehicleId,
    lastOdometer?.prefill ? lastOdometer.odometer : undefined,
    onSuccess,
    onClose,
  );
  const otherForm = useOtherExpenseForm(vehicleId, onSuccess, onClose);
  const loading = partForm.loading || otherForm.loading;

  const {
    control,
    formState: { errors },
  } = partForm.form;
  const watchedItems = useWatch({ control, name: "items" });
  const error = (message?: string) => message && <p className="text-sm text-danger mt-1">{tRaw(message)}</p>;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      busy={loading}
      title={t("partForm.title")}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="part-form" disabled={loading}>
            {loading
              ? t("common.saving")
              : formType === "part"
                ? t("partForm.savePart")
                : t("partForm.saveOther")}
          </Button>
        </>
      }
    >
      <form
        id="part-form"
        onSubmit={formType === "part" ? partForm.onSubmit : otherForm.onSubmit}
        className="space-y-4"
      >
        <div>
          <Label>{t("partForm.type")}</Label>
          <div className="flex gap-2 mt-1.5">
            {(["part", "other"] as const).map((type) => (
              <Button
                key={type}
                type="button"
                variant={formType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFormType(type)}
              >
                {t(type === "part" ? "partForm.typePart" : "partForm.typeOther")}
              </Button>
            ))}
          </div>
        </div>

        {formType === "other" ? (
          <OtherExpenseFields {...otherForm} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t("partForm.date")} *</Label>
                <Controller
                  control={control}
                  name="installDate"
                  render={({ field, fieldState }) => (
                    <>
                      <Input type="date" {...field} className="mt-1.5" />
                      {error(fieldState.error?.message)}
                    </>
                  )}
                />
              </div>
              <div>
                <Label>{t("partForm.odoAtInstall")}</Label>
                <InputNumber
                  control={control}
                  name="odometer"
                  placeholder={
                    lastOdometer
                      ? t("common.lastOdometerHint", {
                          km: formatNumber(lastOdometer.odometer, locale),
                          date: formatDate(lastOdometer.date, locale),
                        })
                      : t("common.optional")
                  }
                  thousandSeparator
                  suffix="km"
                  className="mt-1.5"
                />
                {error(errors.odometer?.message)}
              </div>
            </div>

            <div className="space-y-3">
              {partForm.items.map((item, index) => {
                const itemErrors = errors.items?.[index];
                const noWarranty = watchedItems?.[index]?.noWarranty ?? false;
                return (
                  <EntryRow
                    key={item.id}
                    title={t("partForm.itemTitle", { n: index + 1 })}
                    onRemove={partForm.items.length > 1 ? () => partForm.removeItem(index) : undefined}
                    removeLabel={t("common.removeRow")}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>{t("partForm.name")} *</Label>
                        <Controller
                          control={control}
                          name={`items.${index}.name`}
                          render={({ field }) => (
                            <Input {...field} placeholder={t("partForm.nameHint")} className="mt-1.5" />
                          )}
                        />
                        {error(itemErrors?.name?.message)}
                      </div>
                      <div>
                        <Label>{t("partForm.cost")} *</Label>
                        <InputNumber
                          control={control}
                          name={`items.${index}.cost`}
                          thousandSeparator
                          suffix="đ"
                          className="mt-1.5"
                        />
                        {error(itemErrors?.cost?.message)}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <Label>
                          {t("partForm.warranty")}
                          {!noWarranty && " *"}
                        </Label>
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                          <Controller
                            control={control}
                            name={`items.${index}.noWarranty`}
                            render={({ field }) => (
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                                className="h-4 w-4 rounded border-border bg-surface accent-primary"
                              />
                            )}
                          />
                          {t("partForm.noWarranty")}
                        </label>
                      </div>
                      {/* Kept while disabled so unticking brings the number back */}
                      <InputNumber
                        control={control}
                        name={`items.${index}.warrantyMonths`}
                        suffix={t("common.months")}
                        disabled={noWarranty}
                        className="mt-1.5"
                      />
                      {!noWarranty && error(itemErrors?.warrantyMonths?.message)}
                    </div>

                    <div>
                      <Label>{t("partForm.note")} ({t("common.optional")})</Label>
                      <Controller
                        control={control}
                        name={`items.${index}.note`}
                        render={({ field }) => (
                          <Input {...field} value={field.value ?? ""} placeholder={t("common.noteHint")} className="mt-1.5" />
                        )}
                      />
                    </div>
                  </EntryRow>
                );
              })}
              <AddRowButton label={t("partForm.addItem")} onClick={partForm.addItem} />
            </div>
          </>
        )}
      </form>
    </Dialog>
  );
}
