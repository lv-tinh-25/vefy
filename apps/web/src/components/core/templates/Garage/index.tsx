"use client";

import { useState } from "react";
import { useGaragePage } from "@/hooks/garage/useGaragePage";
import { useT } from "@/lib/i18n";
import { AppShell } from "@/components/core/molecules/AppShell";
import { Button } from "@/components/core/atoms/Button";
import { UserMenu } from "@/components/core/molecules/UserMenu";
import { VehicleCard } from "./VehicleCard";
import { VehicleFormModal } from "./VehicleFormModal";
import { PageSpinner } from "@/components/core/atoms/Spinner";
import { Plus, Car } from "lucide-react";

export function GarageContent() {
  const { vehicles, mutate } = useGaragePage();
  const { t } = useT();
  const [showForm, setShowForm] = useState(false);

  return (
    <AppShell
      header={
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold font-heading text-primary tracking-tight">{t("garage.brand")}</h1>
          <UserMenu />
        </div>
      }
    >
      {!vehicles ? (
        <PageSpinner />
      ) : vehicles.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface border border-border mx-auto mb-5">
            <Car className="h-10 w-10 text-faint" />
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">{t("garage.empty")}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t("garage.emptyHint")}</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            {t("garage.addNewVehicle")}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-heading text-foreground">
              {t("nav.garage")}
            </h2>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" />
              {t("garage.addVehicle")}
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map((v, i) => (
              <div key={v.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                <VehicleCard vehicle={v} />
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && <VehicleFormModal open onClose={() => setShowForm(false)} onSuccess={() => mutate()} />}
    </AppShell>
  );
}
