"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/core/molecules/Card";
import { Button } from "@/components/core/atoms/Button";
import { Badge } from "@/components/core/atoms/Badge";
import { PartFormModal } from "./PartFormModal";
import { ConfirmDialog } from "@/components/core/molecules/ConfirmDialog";
import { useParts } from "@/hooks/vehicles/useParts";
import { useT } from "@/lib/i18n";
import { formatDate, formatNumber } from "@/lib/utils";
import { PageSpinner } from "@/components/core/atoms/Spinner";
import { Plus, Trash2, Wrench } from "lucide-react";

export function VehiclePartsContent() {
  const params = useParams();
  const vehicleId = String(params.id);
  const { t, locale } = useT();
  const {
    vehicle, showForm, setShowForm, deleteId, setDeleteId,
    deleting, deletePart, mutate,
  } = useParts(vehicleId);

  if (!vehicle) return <PageSpinner />;

  function getWarrantyStatus(expiryDate: string): { variant: "danger" | "warning" | "success"; label: string } {
    const now = new Date();
    const expiry = new Date(expiryDate + "T00:00:00");
    const days = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { variant: "danger", label: t("parts.warrantyExpired", { days: Math.abs(days) }) };
    if (days <= 30) return { variant: "warning", label: t("parts.warrantyRemaining", { days }) };
    return { variant: "success", label: t("parts.warrantyRemaining", { days }) };
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => setShowForm(true)} className="w-full">
        <Plus className="h-4 w-4" />
        {t("parts.addPart")}
      </Button>

      {vehicle.parts.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border mx-auto mb-4">
            <Wrench className="h-8 w-8 text-faint" />
          </div>
          <p className="text-sm text-faint">{t("parts.noParts")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicle.parts.map((part) => {
            const warranty = getWarrantyStatus(part.warrantyExpiry);
            return (
              <Card key={part.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm text-foreground">{part.name}</h4>
                        <Badge variant={warranty.variant}>{warranty.label}</Badge>
                      </div>
                      <div className="flex gap-4 mt-1.5 text-xs text-muted-foreground">
                        <span>{t("parts.installDate")}: {formatDate(part.installDate, locale)}</span>
                        {part.odometer && <span>{t("parts.odo")}: {formatNumber(part.odometer, locale)} km</span>}
                        <span>{t("parts.warrantyMonths")}: {part.warrantyMonths} {t("parts.monthUnit")}</span>
                      </div>
                      <div className="text-xs text-faint mt-0.5">{t("parts.warrantyExpiry")}: {formatDate(part.warrantyExpiry, locale)}</div>
                      {part.note && <p className="text-xs text-faint mt-1">{part.note}</p>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(part.id)} className="text-faint hover:text-danger shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showForm && <PartFormModal open onClose={() => setShowForm(false)} onSuccess={() => mutate()} vehicleId={vehicleId} />}

      {deleteId !== null && (
        <ConfirmDialog
          open
          onClose={() => setDeleteId(null)}
          onConfirm={deletePart}
          title={t("parts.deleteTitle")}
          description={t("parts.deleteConfirm")}
          loading={deleting}
        />
      )}
    </div>
  );
}
