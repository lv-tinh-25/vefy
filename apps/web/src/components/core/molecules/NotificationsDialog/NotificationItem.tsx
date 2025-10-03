"use client";

import { useState } from "react";
import Link from "next/link";
import { useSwipeable } from "react-swipeable";
import { AlertTriangle, Trash2, X } from "lucide-react";
import type { Alert } from "@vefy/shared";
import { useT } from "@/lib/i18n";
import { getAlertLabel } from "@/lib/alert-label";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  alert: Alert;
  onDismiss: (alertKey: string) => void | Promise<void>;
  onNavigate: () => void;
}

const SWIPE_REVEAL = 96;

export function NotificationItem({ alert, onDismiss, onNavigate }: NotificationItemProps) {
  const { t } = useT();
  const [revealed, setRevealed] = useState(false);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => setRevealed(true),
    onSwipedRight: () => setRevealed(false),
    preventScrollOnSwipe: true,
    delta: 25,
  });

  const handleClick = (e: React.MouseEvent) => {
    if (revealed) {
      e.preventDefault();
      setRevealed(false);
      return;
    }
    onNavigate();
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onDismiss(alert.key);
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute inset-y-0 right-0 flex w-24 items-center justify-center gap-1.5 bg-danger text-white text-sm font-medium md:hidden"
        aria-label={t("notifications.dismiss")}
      >
        <Trash2 className="h-4 w-4" />
        {t("notifications.dismiss")}
      </button>

      <Link
        href={`/vehicle/${alert.vehicleId}/overview`}
        prefetch
        {...swipeHandlers}
        onClick={handleClick}
        className={cn(
          "relative flex items-center justify-between gap-3 bg-surface px-3 py-3 transition-transform duration-200 cursor-pointer touch-pan-y no-underline",
          revealed ? "-translate-x-24" : "translate-x-0",
        )}
        style={{ transform: revealed ? `translateX(-${SWIPE_REVEAL}px)` : "translateX(0)" }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <AlertTriangle
            className={cn(
              "h-4 w-4 shrink-0",
              alert.status === "danger" ? "text-danger" : "text-warning",
            )}
          />
          <span className="truncate text-sm text-foreground">{getAlertLabel(alert, t)}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {alert.daysRemaining !== null && (
            <span className="text-xs text-muted-foreground">
              {alert.daysRemaining < 0
                ? t("alerts.expiredDays", { days: Math.abs(alert.daysRemaining) })
                : t("alerts.remainingDays", { days: alert.daysRemaining })}
            </span>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            className="hidden md:inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"
            aria-label={t("notifications.dismiss")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Link>
    </div>
  );
}
