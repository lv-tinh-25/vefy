"use client";

import useSWR from "swr";
import { api } from "@/lib/api";

export function useVehicleExpenses(vehicleId: string) {
  return useSWR(`vehicle-${vehicleId}-expenses`, async () => {
    const res = await api.api.vehicles[":vehicleId"].expenses.$get({
      param: { vehicleId },
    });
    if (!res.ok) throw new Error("Failed to fetch expenses");
    return res.json();
  });
}
