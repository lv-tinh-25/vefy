"use client";

import { useState } from "react";
import { useVehicle } from "./useVehicle";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";

export function useParts(vehicleId: string) {
  const { data: vehicle, mutate } = useVehicle(vehicleId);
  const { t } = useT();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deletePart = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.api.vehicles[":vehicleId"].parts[":id"].$delete({
        param: { vehicleId, id: deleteId },
      });
      if (!res.ok) {
        notify.error(t("toast.deleteFailed"));
        return;
      }
      await mutate();
      setDeleteId(null);
      notify.success(t("toast.partDeleted"));
    } catch {
      notify.error(t("auth.errorConnection"));
    } finally {
      setDeleting(false);
    }
  };

  return {
    vehicle, showForm, setShowForm, deleteId, setDeleteId,
    deleting, deletePart, mutate,
  };
}
