"use client";

import { Controller } from "react-hook-form";
import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { Input } from "@/components/core/atoms/Input";
import { InputNumber } from "@/components/core/atoms/InputNumber";
import { Label } from "@/components/core/atoms/Label";
import { useT } from "@/lib/i18n";
import { usePartForm } from "@/hooks/vehicles/usePartForm";

interface PartFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleId: string;
}

export function PartFormModal({ open, onClose, onSuccess, vehicleId }: PartFormModalProps) {
  const { t, tRaw } = useT();
  const { form, formType, setFormType, loading, onSubmit } = usePartForm(
    vehicleId,
    onSuccess,
    onClose,
  );
  const { control } = form;

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
            </div>

            <div>
              <Label>{t("partForm.odoAtInstall")}</Label>
              <InputNumber
                control={control}
                name="odometer"
                placeholder={t("common.optional")}
                thousandSeparator
                suffix="km"
                className="mt-1.5"
              />
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
