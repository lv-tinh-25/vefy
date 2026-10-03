"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createOtherExpenseSchema, type CreateOtherExpense, todayDateStr } from "@vefy/shared";
import { api } from "@/lib/api";

export function useOtherExpenseForm(
  vehicleId: string,
  onSuccess: () => Promise<unknown> | void,
  onClose: () => void,
) {
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
      if (res.ok) {
        form.reset();
        // Wait for the list to refetch so the dialog closes onto fresh data
        await onSuccess();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  });

  return { form, loading, onSubmit };
}
