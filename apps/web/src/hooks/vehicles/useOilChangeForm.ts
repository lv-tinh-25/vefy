"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOilChangeSchema, type InsertOilChange, todayDateStr } from "@vefy/shared";
import { api } from "@/lib/api";

export function useOilChangeForm(vehicleId: string, onSuccess: () => void, onClose: () => void) {
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
        onSuccess();
        onClose();
      } else {
        const body = await res.json();
        setError("error" in body && typeof body.error === "string" ? body.error : "Error");
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  });

  return { form, loading, error, onSubmit };
}
