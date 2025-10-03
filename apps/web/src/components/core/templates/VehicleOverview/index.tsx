"use client";

import { useParams } from "next/navigation";
import { useVehicle } from "@/hooks/vehicles/useVehicle";
import { Card, CardContent } from "@/components/core/molecules/Card";
import { Badge } from "@/components/core/atoms/Badge";
import { OilPredictionCard } from "./OilPredictionCard";
import { StatusCard } from "./StatusCard";
import { VehicleActionsMenu } from "./VehicleActionsMenu";
import { useT } from "@/lib/i18n";
import { getBrandLabel } from "@/lib/brand-label";
import { PageSpinner } from "@/components/core/atoms/Spinner";
import { Car, Bike, Shield, FileCheck, HeartPulse } from "lucide-react";
import type { AlertStatus } from "@vefy/shared";

const NEUTRAL_ALERT: { status: AlertStatus; daysRemaining: null; expiryDate: null } = {
  status: "neutral",
  daysRemaining: null,
  expiryDate: null,
};

export function VehicleOverviewContent() {
  const params = useParams();
  const id = String(params.id);
  const { data: vehicle } = useVehicle(id);
  const { t } = useT();

  if (!vehicle) return <PageSpinner />;

  const VehicleIcon = vehicle.type === "car" ? Car : Bike;

  const findAlert = (type: string) =>
    vehicle.alerts.find((a) => a.type === type) ?? NEUTRAL_ALERT;

  const warranty = findAlert("warranty");
  const registration = findAlert("registration");
  const insurance = findAlert("insurance");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-muted">
          <VehicleIcon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-foreground truncate">{vehicle.name}</h2>
            <Badge className="shrink-0">
              {vehicle.type === "car" ? t("common.car") : t("common.motorcycle")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {getBrandLabel(vehicle.brand, t)} {vehicle.model} · {vehicle.year} · {vehicle.licensePlate}
          </p>
        </div>
        <VehicleActionsMenu vehicleId={id} vehicleName={vehicle.name || `${getBrandLabel(vehicle.brand, t)} ${vehicle.model}`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <StatusCard icon={Shield} title={t("overview.warranty")} expiryDate={warranty.expiryDate} daysRemaining={warranty.daysRemaining} status={warranty.status} />
        {vehicle.type === "car" && (
          <StatusCard icon={FileCheck} title={t("overview.registration")} expiryDate={registration.expiryDate} daysRemaining={registration.daysRemaining} status={registration.status} />
        )}
        <StatusCard icon={HeartPulse} title={t("overview.insurance")} expiryDate={insurance.expiryDate} daysRemaining={insurance.daysRemaining} status={insurance.status} />
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{t("overview.oilStatus")}</h3>
        {vehicle.oilPrediction ? (
          <OilPredictionCard prediction={vehicle.oilPrediction} oilCycleKm={vehicle.oilCycleKm} />
        ) : (
          <Card>
            <CardContent className="p-4 text-center text-sm text-faint">{t("overview.noOilData")}</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
