"use client";

import { useState } from "react";
import Link from "next/link";
import { BellOff, BellRing } from "lucide-react";
import { Dialog } from "@/components/core/molecules/Dialog";
import { ConfirmDialog } from "@/components/core/molecules/ConfirmDialog";
import { useT } from "@/lib/i18n";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { useReminderSettings } from "@/hooks/account/useReminderSettings";
import { NotificationItem } from "./NotificationItem";

interface NotificationsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDialog({ open, onClose }: NotificationsDialogProps) {
  const { t } = useT();
  const { activeAlerts, vehicleNames, dismiss, dismissAll } = useNotifications();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dismissingAll, setDismissingAll] = useState(false);
  const { support, pushEnabled, pushAvailable } = useReminderSettings();
  const showPushHint = pushAvailable && !pushEnabled && (support === "supported" || support === "ios-install");

  // One group per vehicle, in the order vehicles first appear (alerts arrive grouped already)
  const groups = [...new Set(activeAlerts.map((a) => a.vehicleId))].map((vehicleId) => ({
    vehicleId,
    alerts: activeAlerts.filter((a) => a.vehicleId === vehicleId),
  }));

  const handleDismissAll = async () => {
    setDismissingAll(true);
    try {
      await dismissAll();
      setConfirmOpen(false);
    } finally {
      setDismissingAll(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        title={
          activeAlerts.length > 0
            ? `${t("notifications.title")} (${activeAlerts.length})`
            : t("notifications.title")
        }
      >
        {activeAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BellOff className="h-10 w-10 text-faint mb-3" />
            <p className="text-sm text-muted-foreground">{t("notifications.empty")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground md:hidden">
                {t("notifications.swipeHint")}
              </p>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="ml-auto text-sm font-medium text-danger hover:underline"
              >
                {t("notifications.dismissAll")}
              </button>
            </div>
            {groups.map((group) => (
              <section key={group.vehicleId} className="space-y-2">
                <h3 className="flex items-center gap-2 px-1 pt-1 text-sm font-semibold text-foreground">
                  <span className="truncate">{vehicleNames[group.vehicleId] ?? ""}</span>
                  <span className="text-xs font-normal text-muted-foreground">({group.alerts.length})</span>
                </h3>
                {group.alerts.map((alert) => (
                  <NotificationItem key={alert.key} alert={alert} onDismiss={dismiss} onNavigate={onClose} />
                ))}
              </section>
            ))}
          </div>
        )}

        {showPushHint && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-primary-muted/40 px-3 py-2.5">
            <BellRing className="h-4 w-4 shrink-0 text-primary" />
            <p className="flex-1 text-xs text-foreground">{t("notifications.enableHint")}</p>
            <Link
              href="/account#reminders"
              onClick={onClose}
              className="shrink-0 text-xs font-semibold text-primary hover:underline"
            >
              {t("notifications.enableHintAction")}
            </Link>
          </div>
        )}
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDismissAll}
        title={t("notifications.dismissAllConfirmTitle")}
        description={t("notifications.dismissAllConfirm", { count: activeAlerts.length })}
        loading={dismissingAll}
      />
    </>
  );
}
