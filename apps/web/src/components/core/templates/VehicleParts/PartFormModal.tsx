"use client";

import { Controller } from "react-hook-form";
import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { Input } from "@/components/core/atoms/Input";
import { InputNumber } from "@/components/core/atoms/InputNumber";
import { Label } from "@/components/core/atoms/Label";
import { useT } from "@/lib/i18n";
import { usePartForm } from "@/hooks/vehicles/usePartForm";
import type { LastOdometer } from "@/lib/last-odometer";
import { formatDate, formatNumber } from "@/lib/utils";

interface PartFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<unknown> | void;
  vehicleId: string;
  lastOdometer: LastOdometer | null;
}

export function PartFormModal({ open, onClose, onSuccess, vehicleId, lastOdometer }: PartFormModalProps) {
  const { t, tRaw, locale } = useT();
  const { form, formType, setFormType, loading, onSubmit } = usePartForm(
    vehicleId,
    lastOdometer?.prefill ? lastOdometer.odometer : undefined,
    onSuccess,
    onClose,
  );
  const {
    control,
    formState: { errors },
  } = form;

  const fieldError = (message?: string) =>
    message && <p className="text-sm text-danger mt-1">{tRaw(message)}</p>;

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
      <form id="part-form" onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>{t("partForm.type")}</Label>
          <div className="flex gap-2 mt-1.5">
            <Button
              type="button"
              variant={formType === "part" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormType("part")}
            >
              {t("partForm.typePart")}
            </Button>
            <Button
              type="button"
              variant={formType === "other" ? "default" : "outline"}
              size="sm"
              onClick={() => setFormType("other")}
            >
              {t("partForm.typeOther")}
            </Button>
          </div>
        </div>

        <div>
          <Label>{t("partForm.name")} *</Label>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <>
                <Input
                  {...field}
                  placeholder={
                    formType === "part"
                      ? t("partForm.nameHint")
                      : t("partForm.nameOtherHint")
                  }
                  className="mt-1.5"
                />
                {fieldState.error && (
                  <p className="text-sm text-danger mt-1">
                    {tRaw(fieldState.error.message)}
                  </p>
                )}
              </>
            )}
          />
        </div>

        <div>
          <Label>{t("partForm.cost")} *</Label>
          <InputNumber
            control={control}
            name="cost"
            thousandSeparator
            suffix="₫"
            className="mt-1.5"
          />
          {fieldError(errors.cost?.message)}
        </div>

        {formType === "part" && (
          <>
            <div>
              <Label>{t("partForm.date")} *</Label>
              <Controller
                control={control}
                name="installDate"
                render={({ field, fieldState }) => (
                  <>
                    <Input type="date" {...field} className="mt-1.5" />
                    {fieldState.error && (
                      <p className="text-sm text-danger mt-1">
                        {tRaw(fieldState.error.message)}
                      </p>
                    )}
                  </>
                )}
              />
            </div>

            <div>
              <Label>{t("partForm.warranty")}</Label>
              <InputNumber
                control={control}
                name="warrantyMonths"
                suffix={t("common.months")}
                className="mt-1.5"
              />
              {fieldError(errors.warrantyMonths?.message)}
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
              {fieldError(errors.odometer?.message)}
            </div>
          </>
        )}

        <div>
          <Label>{t("partForm.note")}</Label>
          <Controller
            control={control}
            name="note"
            render={({ field }) => (
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder={t("common.noteHint")}
                className="mt-1.5"
              />
            )}
          />
        </div>
      </form>
    </Dialog>
  );
}
