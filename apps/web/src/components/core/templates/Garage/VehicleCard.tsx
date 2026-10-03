"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/core/molecules/Card";
import { Badge } from "@/components/core/atoms/Badge";
import { useT } from "@/lib/i18n";
import { getBrandLabel } from "@/lib/brand-label";
import { Car, Bike, AlertTriangle, Droplets, Wrench } from "lucide-react";
import { getColorHex } from "@vefy/shared";

interface VehicleCardProps {
  vehicle: {
    id: string;
    type: "car" | "motorcycle";
    name: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    color: string;
    activeAlertCount: number;
    oilChangeCount: number;
    partCount: number;
  };
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const { t } = useT();
  const Icon = vehicle.type === "car" ? Car : Bike;
  const colorHex = getColorHex(vehicle.color);

  return (
    <Link href={`/vehicle/${vehicle.id}/overview`}>
      <Card className="hover:border-primary/20 hover:shadow-glow hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl shrink-0 transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: colorHex + "20" }}
            >
              <Icon className="h-6 w-6" style={{ color: colorHex === "#FFFFFF" ? "#94a3b8" : colorHex }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate text-foreground">{vehicle.name}</h3>
                <Badge className="shrink-0">
                  {vehicle.type === "car" ? t("common.car") : t("common.motorcycle")}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {getBrandLabel(vehicle.brand, t)} {vehicle.model} · {vehicle.year}
              </p>
              <p className="text-xs text-faint mt-0.5">{vehicle.licensePlate}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-3 pt-3 border-t border-border">
            {vehicle.activeAlertCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-danger">
                <AlertTriangle className="h-3 w-3" />
                <span>{vehicle.activeAlertCount}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Droplets className="h-3 w-3" />
              <span>{vehicle.oilChangeCount}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Wrench className="h-3 w-3" />
              <span>{vehicle.partCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
