"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageSpinner } from "@/components/core/atoms/Spinner";
import { useVehicle } from "@/hooks/vehicles/useVehicle";

export default function MaintenancePage() {
  const id = String(useParams().id);
  const router = useRouter();
  const { data: vehicle } = useVehicle(id);

  useEffect(() => {
    if (vehicle) router.replace(`/vehicle/${id}/maintenance/${vehicle.variant === "electric" ? "parts" : "oil"}`);
  }, [vehicle, id, router]);

  return <PageSpinner />;
}
