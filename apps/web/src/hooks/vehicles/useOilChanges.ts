"use client";

import { useState } from "react";
import { useVehicle } from "./useVehicle";
import { api } from "@/lib/api";

export function useOilChanges(vehicleId: string) {
  const { data: vehicle, mutate } = useVehicle(vehicleId);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const deleteOilChange = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.api.vehicles[":vehicleId"]["oil-changes"][":id"].$delete({
        param: { vehicleId, id: deleteId },
      });
      await mutate();
      setDeleteId(null);
    } finally {
      setDeleting(false);
    }
  };

  const saveSettings = async (data: {
    oilCycleKm: number;
    oilUseDays: boolean;
    oilCycleDays?: number;
  }) => {
    setSavingSettings(true);
    try {
      await api.api.vehicles[":id"].$patch({
        param: { id: vehicleId },
        json: data,
      });
      await mutate();
    } finally {
      setSavingSettings(false);
    }
  };

  return {
    vehicle, showForm, setShowForm, deleteId, setDeleteId,
    deleting, savingSettings, deleteOilChange, saveSettings, mutate,
  };
}
