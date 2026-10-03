"use client";

import { useBackgroundRevalidating } from "@/lib/swr-activity";
import { cn } from "@/lib/utils";

export function RefreshIndicator() {
  const active = useBackgroundRevalidating();

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden transition-opacity duration-200",
        // Delay the fade-in so quick refetches don't flash the bar
        active ? "opacity-100 delay-150" : "opacity-0",
      )}
    >
      <div className="h-full w-1/3 bg-primary animate-indeterminate" />
    </div>
  );
}
