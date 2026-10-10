"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleSchema, type InsertVehicle } from "@vefy/shared";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";

export function useVehicleForm(onSuccess: () => Promise<unknown> | void, onClose: () => void) {
  const { t } = useT();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");

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
      if (!res.ok) {
        notify.error(t("toast.saveFailed"));
        return;
      }
      let photoUploaded = true;
      if (image) {
        const vehicle = await res.json();
        // The vehicle exists either way; a failed photo upload can be retried from its documents tab
        photoUploaded = await api.api.vehicles[":vehicleId"].image
          .$post({ param: { vehicleId: vehicle.id }, json: { image } })
          .then((r) => r.ok, () => false);
      }
      // Wait for the list to refetch so the dialog closes onto fresh data
      await onSuccess();
      onClose();
      if (photoUploaded) notify.success(t("toast.vehicleCreated"));
      else notify.error(t("toast.vehiclePhotoFailed"));
    } catch {
      notify.error(t("auth.errorConnection"));
    } finally {
      setLoading(false);
    }
  });

  return { form, loading, onSubmit, image, setImage };
}
