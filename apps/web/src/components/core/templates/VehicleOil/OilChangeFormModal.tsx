"use client";

import { Controller } from "react-hook-form";
import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { Input } from "@/components/core/atoms/Input";
import { InputNumber } from "@/components/core/atoms/InputNumber";
import { Label } from "@/components/core/atoms/Label";
import { OcrButton } from "@/components/core/molecules/OcrButton";
import { useT } from "@/lib/i18n";
import { useOilChangeForm } from "@/hooks/vehicles/useOilChangeForm";

interface OilChangeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleId: string;
}

export function OilChangeFormModal({ open, onClose, onSuccess, vehicleId }: OilChangeFormModalProps) {
  const { t, tRaw } = useT();
  const { form, loading, error, onSubmit } = useOilChangeForm(vehicleId, onSuccess, onClose);
  const {
    control,
    setValue,
    formState: { errors },
  } = form;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("oilForm.title")}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onClose}>{t("common.cancel")}</Button>
          <Button type="submit" form="oil-change-form" disabled={loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </>
      }
    >
      <form id="oil-change-form" onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>{t("oilForm.date")} *</Label>
          <Controller control={control} name="date" render={({ field, fieldState }) => (
            <>
              <Input type="date" {...field} className="mt-1.5" />
              {fieldState.error && <p className="text-sm text-danger mt-1">{tRaw(fieldState.error.message)}</p>}
            </>
          )} />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label>{t("oilForm.odometer")} *</Label>
            <OcrButton onResult={(km) => setValue("odometer", km)} />
          </div>
          <InputNumber
            control={control}
            name="odometer"
            placeholder={t("oilForm.odometerHint")}
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

        <div>
          <Label>{t("oilForm.cost")} *</Label>
          <InputNumber
            control={control}
            name="cost"
            thousandSeparator
            suffix="₫"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>{t("oilForm.oilType")} ({t("common.optional")})</Label>
          <Controller control={control} name="oilType" render={({ field }) => <Input {...field} value={field.value ?? ""} placeholder={t("oilForm.oilTypeHint")} className="mt-1.5" />} />
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
