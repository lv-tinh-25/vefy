"use client";

import useSWR from "swr";
import { api } from "@/lib/api";

export function useGaragePage() {
  const { data, mutate } = useSWR("vehicles", async () => {
    const res = await api.api.vehicles.$get();
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

  return { vehicles: data, mutate };
}
