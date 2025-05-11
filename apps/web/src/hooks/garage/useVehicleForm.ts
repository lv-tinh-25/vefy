"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleSchema, type InsertVehicle } from "@vefy/shared";
import { api } from "@/lib/api";

export function useVehicleForm(onSuccess: () => void, onClose: () => void) {
  const [loading, setLoading] = useState(false);

  const form = useForm<InsertVehicle>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      type: "car",
      color: "Trắng",
      name: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      licensePlate: "",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setLoading(true);
    try {
      const res = await api.api.vehicles.$post({ json: data });
      if (res.ok) {
        form.reset();
        onSuccess();
        onClose();
      }
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  });

  return { form, loading, onSubmit };
}
