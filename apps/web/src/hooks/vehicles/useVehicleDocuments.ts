"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useVehicle } from "./useVehicle";
import { updateVehicleInfoSchema, type UpdateVehicleInfo } from "@vefy/shared";
import { api } from "@/lib/api";

export function useVehicleDocuments(vehicleId: string) {
  const { data: vehicle, mutate } = useVehicle(vehicleId);
  const [saving, setSaving] = useState(false);

  const form = useForm<UpdateVehicleInfo>({
    resolver: zodResolver(updateVehicleInfoSchema),
    values: vehicle
      ? {
          name: vehicle.name,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          warrantyExpiry: vehicle.warrantyExpiry,
          registrationExpiry: vehicle.registrationExpiry,
          insuranceExpiry: vehicle.insuranceExpiry,
        }
      : undefined,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setSaving(true);
    try {
      await api.api.vehicles[":id"].$patch({
        param: { id: vehicleId },
        json: data,
      });
      await mutate();
    } finally {
      setSaving(false);
    }
  });

  const findAlert = (type: string) => vehicle?.alerts.find((a) => a.type === type);

  return { vehicle, form, saving, onSubmit, findAlert };
}
