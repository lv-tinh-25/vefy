"use client";

import { Controller } from "react-hook-form";
import { Input } from "@/components/core/atoms/Input";
import { InputNumber } from "@/components/core/atoms/InputNumber";
import { Label } from "@/components/core/atoms/Label";
import { AddRowButton, EntryRow } from "@/components/core/molecules/EntryRow";
import { useT } from "@/lib/i18n";
import type { OtherExpenseFormState } from "@/hooks/vehicles/useOtherExpenseForm";

/** Date plus one row per "other" expense; shared by the expenses tab and the parts form */
export function OtherExpenseFields({ form, items, addItem, removeItem }: OtherExpenseFormState) {
  const { t, tRaw } = useT();
  const {
    control,
    formState: { errors },
  } = form;
  const error = (message?: string) => message && <p className="text-sm text-danger mt-1">{tRaw(message)}</p>;

  return (
    <>
      <div>
        <Label>{t("expenseForm.date")} *</Label>
        <Controller
          control={control}
          name="date"
          render={({ field, fieldState }) => (
            <>
              <Input type="date" {...field} className="mt-1.5" />
              {error(fieldState.error?.message)}
            </>
          )}
        />
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const itemErrors = errors.items?.[index];
          return (
            <EntryRow
              key={item.id}
              title={t("expenseForm.itemTitle", { n: index + 1 })}
              onRemove={items.length > 1 ? () => removeItem(index) : undefined}
              removeLabel={t("common.removeRow")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>{t("expenseForm.name")} *</Label>
                  <Controller
                    control={control}
                    name={`items.${index}.name`}
                    render={({ field }) => (
                      <Input {...field} placeholder={t("partForm.nameOtherHint")} className="mt-1.5" />
                    )}
                  />
                  {error(itemErrors?.name?.message)}
                </div>
                <div>
                  <Label>{t("expenseForm.amount")} *</Label>
                  <InputNumber control={control} name={`items.${index}.amount`} thousandSeparator suffix="đ" className="mt-1.5" />
                  {error(itemErrors?.amount?.message)}
                </div>
              </div>
              <div>
                <Label>{t("expenseForm.note")} ({t("common.optional")})</Label>
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
        <AddRowButton label={t("expenseForm.addItem")} onClick={addItem} />
      </div>
    </>
  );
}
