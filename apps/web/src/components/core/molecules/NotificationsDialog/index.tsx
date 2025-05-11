"use client";

import { useState } from "react";
import { BellOff } from "lucide-react";
import { Dialog } from "@/components/core/molecules/Dialog";
import { ConfirmDialog } from "@/components/core/molecules/ConfirmDialog";
import { useT } from "@/lib/i18n";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { NotificationItem } from "./NotificationItem";

interface NotificationsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsDialog({ open, onClose }: NotificationsDialogProps) {
  const { t } = useT();
  const { activeAlerts, dismiss, dismissAll } = useNotifications();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dismissingAll, setDismissingAll] = useState(false);

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
            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <NotificationItem
                  key={alert.key}
                  alert={alert}
                  onDismiss={dismiss}
                  onNavigate={onClose}
                />
              ))}
            </div>
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
