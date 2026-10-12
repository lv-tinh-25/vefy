"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/core/atoms/Button";
import { IconButton } from "@/components/core/atoms/IconButton";
import { RecordItem } from "@/components/core/molecules/RecordItem";
import { Badge } from "@/components/core/atoms/Badge";
import { PartFormModal } from "./PartFormModal";
import { ConfirmDialog } from "@/components/core/molecules/ConfirmDialog";
import { Fab } from "@/components/core/molecules/Fab";
import { useParts } from "@/hooks/vehicles/useParts";
import { getLastOdometer } from "@/lib/last-odometer";
import { formatDaysAgo, PART_INSTALLED_KEYS } from "@/lib/days-ago";
import { useT } from "@/lib/i18n";
import { formatDate, formatNumber } from "@/lib/utils";
import { PageSpinner } from "@/components/core/atoms/Spinner";
import { Plus, Trash2, Wrench } from "lucide-react";
import { daysBetweenDates, daysUntil, todayDateStr, type Part } from "@vefy/shared";

export function VehiclePartsContent() {
  const params = useParams();
  const vehicleId = String(params.id);
  const { t, locale } = useT();
  const {
    vehicle, showForm, setShowForm, deleteId, setDeleteId,
    deleting, deletePart, mutate,
  } = useParts(vehicleId);

  if (!vehicle) return <PageSpinner />;

  function getWarrantyStatus(part: Part): { variant: "danger" | "warning" | "success" | "neutral"; label: string } {
    if (!part.warrantyExpiry) {
      const days = Math.max(0, daysBetweenDates(part.installDate, todayDateStr()));
      return { variant: "neutral", label: formatDaysAgo(days, t, PART_INSTALLED_KEYS) };
    }
    const days = daysUntil(part.warrantyExpiry);
    if (days < 0) return { variant: "danger", label: t("parts.warrantyExpired", { days: Math.abs(days) }) };
    if (days <= 30) return { variant: "warning", label: t("parts.warrantyRemaining", { days }) };
    return { variant: "success", label: t("parts.warrantyRemaining", { days }) };
  }

  return (
    <div className="space-y-6">
      <Button onClick={() => setShowForm(true)} className="hidden sm:inline-flex w-full">
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
            const warranty = getWarrantyStatus(part);
            return (
              <RecordItem
                key={part.id}
                icon={Wrench}
                title={part.name}
                badge={<Badge variant={warranty.variant}>{warranty.label}</Badge>}
                meta={[
                  formatDate(part.installDate, locale),
                  part.odometer !== null && `${formatNumber(part.odometer, locale)} km`,
                  part.warrantyMonths !== null && t("parts.warrantyPeriod", { months: part.warrantyMonths }),
                ]}
                details={[
                  part.warrantyExpiry && t("parts.warrantyEnds", { date: formatDate(part.warrantyExpiry, locale) }),
                  part.note,
                ]}
                amount={part.cost}
                action={
                  <IconButton icon={Trash2} tone="danger" label={t("common.delete")} onClick={() => setDeleteId(part.id)} />
                }
              />
            );
          })}
        </div>
      )}

      {showForm && (
        <PartFormModal
          open
          onClose={() => setShowForm(false)}
          onSuccess={() => mutate()}
          vehicleId={vehicleId}
          lastOdometer={getLastOdometer(vehicle.oilChanges, vehicle.parts)}
        />
      )}

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

      <Fab label={t("parts.addPart")} onClick={() => setShowForm(true)} />
    </div>
  );
}
