"use client";

import { useParams } from "next/navigation";
import { Controller } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/core/molecules/Card";
import { Input } from "@/components/core/atoms/Input";
import { Label } from "@/components/core/atoms/Label";
import { Button } from "@/components/core/atoms/Button";
import { BrandSelect } from "@/components/core/molecules/BrandSelect";
import { YearDropdown } from "@/components/core/molecules/YearDropdown";
import { AlertBadge } from "@/components/core/molecules/AlertBadge";
import { useVehicleDocuments } from "@/hooks/vehicles/useVehicleDocuments";
import { useT } from "@/lib/i18n";
import { PageSpinner } from "@/components/core/atoms/Spinner";
import { Save } from "lucide-react";

export function VehicleDocumentsContent() {
  const params = useParams();
  const vehicleId = String(params.id);
  const { vehicle, form, saving, onSubmit, findAlert } = useVehicleDocuments(vehicleId);
  const { t } = useT();

  if (!vehicle) return <PageSpinner />;

  const { control } = form;
  const vehicleType = vehicle.type === "car" ? "car" : "motorcycle";

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit}>
        <fieldset disabled={saving} className="min-w-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("documents.vehicleInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t("documents.name")}</Label>
                <Controller control={control} name="name" render={({ field }) => <Input {...field} value={field.value ?? ""} className="mt-1.5" />} />
              </div>
              <div>
                <Label>{t("documents.brand")}</Label>
                <Controller control={control} name="brand" render={({ field }) => (
                  <BrandSelect vehicleType={vehicleType} value={field.value ?? ""} onChange={field.onChange} className="mt-1.5" />
                )} />
              </div>
              <div>
                <Label>{t("documents.model")}</Label>
                <Controller control={control} name="model" render={({ field }) => <Input {...field} value={field.value ?? ""} className="mt-1.5" />} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t("documents.year")}</Label>
                  <YearDropdown control={control} name="year" className="mt-1.5" />
                </div>
                <div>
                  <Label>{t("documents.licensePlate")}</Label>
                  <Controller control={control} name="licensePlate" render={({ field }) => <Input {...field} value={field.value ?? ""} className="mt-1.5" />} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("documents.docsAndExpiry")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label>{t("documents.warrantyExpiry")}</Label>
                  {findAlert("warranty") && <AlertBadge status={findAlert("warranty")!.status} />}
                </div>
                <Controller control={control} name="warrantyExpiry" render={({ field }) => <Input type="date" {...field} value={field.value ?? ""} className="mt-1.5" />} />
              </div>

              {vehicleType === "car" && (
                <div>
                  <div className="flex items-center justify-between">
                    <Label>{t("documents.registrationExpiry")}</Label>
                    {findAlert("registration") && <AlertBadge status={findAlert("registration")!.status} />}
                  </div>
                  <Controller control={control} name="registrationExpiry" render={({ field }) => <Input type="date" {...field} value={field.value ?? ""} className="mt-1.5" />} />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <Label>{t("documents.insuranceExpiry")}</Label>
                  {findAlert("insurance") && <AlertBadge status={findAlert("insurance")!.status} />}
                </div>
                <Controller control={control} name="insuranceExpiry" render={({ field }) => <Input type="date" {...field} value={field.value ?? ""} className="mt-1.5" />} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={saving} className="w-full">
            <Save className="h-4 w-4" />
            {saving ? t("common.saving") : t("common.saveChanges")}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}
