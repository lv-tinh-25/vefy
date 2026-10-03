"use client";

import { useState } from "react";
import { useVehicle } from "./useVehicle";
import { api } from "@/lib/api";

export function useParts(vehicleId: string) {
  const { data: vehicle, mutate } = useVehicle(vehicleId);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const deletePart = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.api.vehicles[":vehicleId"].parts[":id"].$delete({
        param: { vehicleId, id: deleteId },
      });
      await mutate();
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  return {
    vehicle, showForm, setShowForm, deleteId, setDeleteId,
    deleting, deletePart, mutate,
  };
}
