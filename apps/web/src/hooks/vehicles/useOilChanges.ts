"use client";

import { useState } from "react";
import { useVehicle } from "./useVehicle";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";
import type { OilSetting } from "@vefy/shared";

export function useOilChanges(vehicleId: string) {
  const { data: vehicle, mutate } = useVehicle(vehicleId);
  const { t } = useT();
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const deleteOilChange = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.api.vehicles[":vehicleId"]["oil-changes"][":id"].$delete({
        param: { vehicleId, id: deleteId },
      });
      if (!res.ok) {
        notify.error(t("toast.deleteFailed"));
        return;
      }
      await mutate();
      setDeleteId(null);
      notify.success(t("toast.oilChangeDeleted"));
    } catch {
      notify.error(t("auth.errorConnection"));
    } finally {
      setDeleting(false);
    }
  };

  const saveSettings = async (settings: OilSetting[]) => {
    setSavingSettings(true);
    try {
      const res = await api.api.vehicles[":vehicleId"]["oil-settings"].$put({
        param: { vehicleId },
        json: { settings },
      });
      if (!res.ok) {
        notify.error(t("toast.saveFailed"));
        return;
      }
      await mutate();
      notify.success(t("toast.oilSettingsSaved"));
    } catch {
      notify.error(t("auth.errorConnection"));
    } finally {
      setSavingSettings(false);
    }
  };

  return {
    vehicle, showForm, setShowForm, deleteId, setDeleteId,
    deleting, savingSettings, deleteOilChange, saveSettings, mutate,
  };
}
