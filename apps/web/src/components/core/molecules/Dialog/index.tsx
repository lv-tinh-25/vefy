"use client";

import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useT } from "@/lib/i18n";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Sticky footer actions (buttons) */
  actions?: ReactNode;
  className?: string;
  /** While a request is in flight, block X / backdrop / Escape so it can't be closed mid-save */
  busy?: boolean;
}

export function Dialog({ open, onClose, title, children, actions, className, busy = false }: DialogProps) {
  const { t } = useT();
  const requestClose = () => {
    if (!busy) onClose();
  };

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, busy, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 animate-fade-in">
      {/* Backdrop — desktop only */}
      <div className="hidden sm:block fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={requestClose} />

      {/* Panel */}
      <div
        className={cn(
          "relative z-10 bg-elevated flex flex-col",
          // Mobile: fullscreen
          "fixed inset-0",
          // Desktop: centered modal
          "sm:inset-auto sm:fixed sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg sm:max-h-[85vh] sm:rounded-2xl sm:border sm:border-border sm:shadow-elevated sm:animate-scale-in",
          className,
        )}
      >
        {/* Header — sticky */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-border sm:px-6">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={requestClose}
            disabled={busy}
            aria-label={t("common.close")}
            className="rounded-lg p-1.5 text-faint hover:text-foreground hover:bg-surface transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {/* Locks every field inside while saving, so the submitted values can't be edited */}
          <fieldset disabled={busy} className="min-w-0">
            {children}
          </fieldset>
        </div>

        {/* Footer actions — sticky */}
        {actions && (
          <div className="shrink-0 flex justify-end gap-3 px-5 py-4 border-t border-border sm:px-6">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
