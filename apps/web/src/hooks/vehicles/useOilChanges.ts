"use client";

import { useState } from "react";
import { useVehicle } from "./useVehicle";
import { api } from "@/lib/api";
import type { OilSetting } from "@vefy/shared";

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

  const saveSettings = async (settings: OilSetting[]) => {
    setSavingSettings(true);
    try {
      await api.api.vehicles[":vehicleId"]["oil-settings"].$put({
        param: { vehicleId },
        json: { settings },
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
