"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOtherExpenseSchema, type CreateOtherExpense, todayDateStr } from "@vefy/shared";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";

export function useOtherExpenseForm(
  vehicleId: string,
  onSuccess: () => Promise<unknown> | void,
  onClose: () => void,
) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateOtherExpense>({
    resolver: zodResolver(createOtherExpenseSchema),
    defaultValues: {
      date: todayDateStr(),
      name: "",
      amount: undefined,
      note: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const res = await api.api.vehicles[":vehicleId"].expenses.$post({
        param: { vehicleId },
        json: {
          date: data.date,
          amount: data.amount,
          name: data.name,
          note: data.note || undefined,
        },
      });
      if (!res.ok) {
        notify.error(t("toast.saveFailed"));
        return;
      }
      // Wait for the list to refetch so the dialog closes onto fresh data
      await onSuccess();
      onClose();
      notify.success(t("toast.expenseAdded"));
    } catch {
      notify.error(t("auth.errorConnection"));
    } finally {
      setLoading(false);
    }
  });

  return { form, loading, onSubmit };
}
