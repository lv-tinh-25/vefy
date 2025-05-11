"use client";

import useSWR from "swr";
import { api } from "@/lib/api";

export function useAllExpenses() {
  return useSWR("expenses-all", async () => {
    const res = await api.api.expenses.$get();
    if (!res.ok) throw new Error("Failed to fetch all expenses");
    return res.json();
  });
}
