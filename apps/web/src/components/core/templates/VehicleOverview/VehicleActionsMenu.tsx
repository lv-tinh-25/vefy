"use client";

import { useVehicleActions } from "@/hooks/vehicles/useVehicleActions";
import { useT } from "@/lib/i18n";
import { ConfirmDialog } from "@/components/core/molecules/ConfirmDialog";
import { MoreVertical, Trash2 } from "lucide-react";

export function VehicleActionsMenu({ vehicleId, vehicleName }: { vehicleId: string; vehicleName: string }) {
  const { t } = useT();
  const {
    menuRef, menuOpen, toggleMenu, confirmOpen, closeConfirm, requestDelete, deleting, deleteVehicle,
  } = useVehicleActions(vehicleId);

  return (
    <>
      <div ref={menuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={toggleMenu}
          aria-label={t("vehicleActions.moreActions")}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface hover:text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-elevated border border-border shadow-elevated animate-scale-in origin-top-right z-50 py-1.5"
          >
            <button
              type="button"
              role="menuitem"
              onClick={requestDelete}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger-muted transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
              {t("vehicleActions.delete")}
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={closeConfirm}
        onConfirm={deleteVehicle}
        loading={deleting}
        title={t("vehicleActions.deleteConfirmTitle")}
        description={t("vehicleActions.deleteConfirm", { name: vehicleName })}
      />
    </>
  );
}
