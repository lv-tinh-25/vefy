"use client";

import useSWR from "swr";
import type { StatsPeriod } from "@vefy/shared";
import { api } from "@/lib/api";

export function useAllExpenseSummary(period: StatsPeriod) {
  return useSWR(`expenses-all-summary-${period}`, async () => {
    const res = await api.api.expenses.summary.$get({
      query: { period },
    });
    if (!res.ok) throw new Error("Failed to fetch all expense summary");
    return res.json();
  });
}
