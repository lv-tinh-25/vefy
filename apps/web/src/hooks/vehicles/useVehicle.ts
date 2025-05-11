"use client";

import useSWR from "swr";
import { api } from "@/lib/api";

export function useVehicle(id: string) {
  return useSWR(`vehicle-${id}`, async () => {
    const res = await api.api.vehicles[":id"].$get({ param: { id } });
    if (!res.ok) throw new Error("Failed to fetch vehicle");
    return res.json();
  });
}
