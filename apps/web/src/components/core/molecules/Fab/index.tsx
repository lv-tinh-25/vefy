"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const LABEL_VISIBLE_MS = 3000;

interface FabProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

/** Phone-only floating add button; the label shows briefly so new users learn what "+" does */
export function Fab({ label, onClick, disabled }: FabProps) {
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setMounted(true);
    const collapse = () => setExpanded(false);
    const timer = setTimeout(collapse, LABEL_VISIBLE_MS);
    window.addEventListener("scroll", collapse, { once: true, passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", collapse);
    };
  }, []);

  return (
    <>
      {/* Keeps the last list row (and its delete button) clear of the floating button */}
      <div aria-hidden className="h-16 sm:hidden" />
      {mounted &&
        // Portalled so a transformed ancestor can't turn `fixed` into `absolute`
        createPortal(
          // The entrance animation lives on the wrapper: its fill-mode would pin the button's
          // opacity/transform and cancel the disabled and pressed styles
          <div className="sm:hidden fixed right-4 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 animate-scale-in">
            <button
              type="button"
              onClick={onClick}
              disabled={disabled}
              aria-label={label}
              className={cn(
                "flex h-14 min-w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-elevated",
                "transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                expanded ? "gap-2 pl-4 pr-5" : "gap-0 px-0",
              )}
            >
              <Plus className="h-6 w-6 shrink-0" />
              <span
                aria-hidden
                className={cn(
                  "overflow-hidden whitespace-nowrap text-sm font-medium transition-all duration-300",
                  expanded ? "max-w-48 opacity-100" : "max-w-0 opacity-0",
                )}
              >
                {label}
              </span>
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
