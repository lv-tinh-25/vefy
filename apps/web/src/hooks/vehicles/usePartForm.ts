"use client";

import { type FormEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPartSchema, type InsertPart, todayDateStr } from "@vefy/shared";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";

export type PartFormType = "part" | "other";

export function usePartForm(
  vehicleId: string,
  prefillOdometer: number | undefined,
  onSuccess: () => Promise<unknown> | void,
  onClose: () => void,
) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [formType, setFormType] = useState<PartFormType>("part");

  const form = useForm({
    resolver: zodResolver(insertPartSchema.omit({ vehicleId: true })),
    defaultValues: {
      name: "",
      installDate: todayDateStr(),
      warrantyMonths: 12,
      odometer: prefillOdometer,
      cost: undefined as number | undefined,
      note: "",
    },
  });

  const submitPart = async (data: Omit<InsertPart, "vehicleId">) => {
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
  };

  const submitOther = async () => {
    const { name, cost, note } = form.getValues();
    if (!name || name.trim().length < 1) {
      form.setError("name", {
        type: "manual",
        message: "validation.expenseNameRequired",
      });
      return;
    }
    if (cost == null) {
      form.setError("cost", { type: "manual", message: "validation.costRequired" });
      return;
    }
    setLoading(true);
    try {
      const today = todayDateStr();
      const res = await api.api.vehicles[":vehicleId"].expenses.$post({
        param: { vehicleId },
        json: {
          date: today,
          amount: cost,
          name,
          note: note || undefined,
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
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (formType === "part") {
      void form.handleSubmit(submitPart)();
    } else {
      void submitOther();
    }
  };

  return { form, formType, setFormType, loading, onSubmit };
}
