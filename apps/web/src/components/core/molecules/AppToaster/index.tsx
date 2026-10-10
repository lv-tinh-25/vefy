"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Toaster } from "sonner";
import { flushPendingToast } from "@/lib/notify";

const DESKTOP_QUERY = "(min-width: 640px)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}


export function AppToaster() {
  const isDesktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => true,
  );

  useEffect(() => {
    flushPendingToast();
  }, []);

  return (
    <Toaster
      position={isDesktop ? "bottom-right" : "top-center"}
      richColors
      closeButton
      duration={3500}
      toastOptions={{
        style: {
          fontFamily: "var(--font-outfit), sans-serif",
        },
      }}
    />
  );
}
