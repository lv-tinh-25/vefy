"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOilChangeSchema, type InsertOilChange, todayDateStr } from "@vefy/shared";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";

export function useOilChangeForm(vehicleId: string, onSuccess: () => Promise<unknown> | void, onClose: () => void) {
  const { t, locale } = useT();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Omit<InsertOilChange, "vehicleId">>({
    resolver: zodResolver(insertOilChangeSchema.omit({ vehicleId: true })),
    defaultValues: {
      date: todayDateStr(),
      odometer: undefined,
      cost: undefined,
      oilType: "",
      note: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.api.vehicles[":vehicleId"]["oil-changes"].$post({
        param: { vehicleId },
        json: data,
      });
      if (res.ok) {
        form.reset();
        // Wait for the list to refetch so the dialog closes onto fresh data
        await onSuccess();
        onClose();
      } else {
        const body = await res.json();
        setError(
          "code" in body && body.code === "ODOMETER_TOO_LOW"
            ? t("oil.errorOdometerTooLow", { km: formatNumber(body.minOdometer, locale) })
            : t("common.error"),
        );
      }
    } catch {
      setError(t("auth.errorConnection"));
    } finally {
      setLoading(false);
    }
  });

  return { form, loading, error, onSubmit };
}
