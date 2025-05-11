"use client";

import useSWR from "swr";
import type { StatsPeriod } from "@vefy/shared";
import { api } from "@/lib/api";

export function useVehicleExpenseSummary(vehicleId: string, period: StatsPeriod) {
  return useSWR(`vehicle-${vehicleId}-expense-summary-${period}`, async () => {
    const res = await api.api.vehicles[":vehicleId"].expenses.summary.$get({
      param: { vehicleId },
      query: { period },
    });
    if (!res.ok) throw new Error("Failed to fetch expense summary");
    return res.json();
  });
}
