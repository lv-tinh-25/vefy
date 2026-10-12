"use client";

import useSWR from "swr";
import { useMemo } from "react";
import type { Alert } from "@vefy/shared";
import { api } from "@/lib/api";

interface NotificationsResponse {
  alerts: Alert[];
  vehicleNames: Record<string, string>;
  dismissedKeys: string[];
}

export function useNotifications() {
  const { data, mutate, isLoading } = useSWR<NotificationsResponse>(
    "notifications",
    async () => {
      const res = await api.api.notifications.$get();
      if (!res.ok) throw new Error("Failed to fetch notifications");
      return (await res.json()) as NotificationsResponse;
    },
  );

  const activeAlerts = useMemo(() => {
    if (!data) return [];
    const dismissed = new Set(data.dismissedKeys);
    return data.alerts.filter((a) => !dismissed.has(a.key));
  }, [data]);

  const dismiss = async (alertKey: string) => {
    await mutate(
      async () => {
        await api.api.notifications.dismiss.$post({ json: { alertKey } });
        return data
          ? { ...data, dismissedKeys: [...data.dismissedKeys, alertKey] }
          : undefined;
      },
      {
        optimisticData: data
          ? { ...data, dismissedKeys: [...data.dismissedKeys, alertKey] }
          : undefined,
        rollbackOnError: true,
        revalidate: false,
      },
    );
  };

  const dismissAll = async () => {
    const keys = activeAlerts.map((a) => a.key);
    if (keys.length === 0) return;
    await mutate(
      async () => {
        await api.api.notifications["dismiss-all"].$post({ json: { alertKeys: keys } });
        return data
          ? { ...data, dismissedKeys: [...data.dismissedKeys, ...keys] }
          : undefined;
      },
      {
        optimisticData: data
          ? { ...data, dismissedKeys: [...data.dismissedKeys, ...keys] }
          : undefined,
        rollbackOnError: true,
        revalidate: false,
      },
    );
  };

  return {
    activeAlerts,
    vehicleNames: data?.vehicleNames ?? {},
    unreadCount: activeAlerts.length,
    isLoading,
    dismiss,
    dismissAll,
    mutate,
  };
}
