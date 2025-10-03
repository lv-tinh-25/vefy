"use client";

import { Controller } from "react-hook-form";
import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { Input } from "@/components/core/atoms/Input";
import { InputNumber } from "@/components/core/atoms/InputNumber";
import { Label } from "@/components/core/atoms/Label";
import { useT } from "@/lib/i18n";
import { useOtherExpenseForm } from "@/hooks/vehicles/useOtherExpenseForm";

interface OtherExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicleId: string;
}

export function OtherExpenseFormModal({
  open,
  onClose,
  onSuccess,
  vehicleId,
}: OtherExpenseFormModalProps) {
  const { t, tRaw } = useT();
  const { form, loading, onSubmit } = useOtherExpenseForm(
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
      title={t("expenseForm.title")}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="other-expense-form" disabled={loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </>
      }
    >
      <form id="other-expense-form" onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label>{t("expenseForm.name")} *</Label>
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <>
                <Input
                  {...field}
                  value={field.value ?? ""}
                  placeholder={t("partForm.nameOtherHint")}
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
          <Label>{t("expenseForm.amount")} *</Label>
          <InputNumber
            control={control}
            name="amount"
            thousandSeparator
            suffix="₫"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>{t("expenseForm.date")} *</Label>
          <Controller
            control={control}
            name="date"
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
          <Label>{t("expenseForm.note")}</Label>
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
