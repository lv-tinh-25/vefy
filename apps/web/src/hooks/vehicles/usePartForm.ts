"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_WARRANTY_MONTHS, insertPartsSchema, type InsertParts, todayDateStr } from "@vefy/shared";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";

// Cost starts empty; the schema rejects it on submit if it's never filled in
const newItem = () => ({
  name: "",
  cost: undefined as unknown as number,
  noWarranty: false,
  warrantyMonths: DEFAULT_WARRANTY_MONTHS,
  note: "",
});

export function usePartForm(
  vehicleId: string,
  prefillOdometer: number | undefined,
  onSuccess: () => Promise<unknown> | void,
  onClose: () => void,
) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);

  const form = useForm<InsertParts>({
    resolver: zodResolver(insertPartsSchema),
    defaultValues: {
      installDate: todayDateStr(),
      odometer: prefillOdometer,
      items: [newItem()],
    },
  });
  const items = useFieldArray({ control: form.control, name: "items" });

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const res = await api.api.vehicles[":vehicleId"].parts.$post({
        param: { vehicleId },
        json: data,
      });
      if (!res.ok) {
        notify.error(t("toast.saveFailed"));
        return;
      }
      // Wait for the list to refetch so the dialog closes onto fresh data
      await onSuccess();
      onClose();
      notify.success(t("toast.partAdded"));
    } catch {
      notify.error(t("auth.errorConnection"));
    } finally {
      setLoading(false);
    }
  });

  return {
    form,
    items: items.fields,
    addItem: () => items.append(newItem()),
    removeItem: items.remove,
    loading,
    onSubmit,
  };
}
