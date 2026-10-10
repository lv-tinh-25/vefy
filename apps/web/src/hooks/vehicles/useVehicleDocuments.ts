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
  const [variantLockedError, setVariantLockedError] = useState(false);
  // null = unchanged; "" = removed; a data URL = new photo awaiting save
  const [imageDraft, setImageDraft] = useState<string | null>(null);
  const image = imageDraft ?? vehicle?.imageUrl ?? "";

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
          variant: vehicle.variant ?? undefined,
        }
      : undefined,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    setSaving(true);
    setVariantLockedError(false);
    try {
      if (imageDraft) {
        await api.api.vehicles[":vehicleId"].image.$post({ param: { vehicleId }, json: { image: imageDraft } });
      } else if (imageDraft === "" && vehicle?.imageUrl) {
        await api.api.vehicles[":vehicleId"].image.$delete({ param: { vehicleId } });
      }
      const res = await api.api.vehicles[":id"].$patch({
        param: { id: vehicleId },
        json: data,
      });
      // An expense was added elsewhere after this page loaded
      if (res.status === 409) setVariantLockedError(true);
      await mutate();
      setImageDraft(null);
    } finally {
      setSaving(false);
    }
  });

  const findAlert = (type: string) => vehicle?.alerts.find((a) => a.type === type);

  const variantLocked = vehicle?.variantLocked ?? false;

  return {
    vehicle, form, saving, onSubmit, findAlert, variantLocked, variantLockedError,
    image, setImage: setImageDraft,
  };
}
