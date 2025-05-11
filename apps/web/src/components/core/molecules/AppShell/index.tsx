"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AppShellProps {
  /** Header content (left side, right side, tabs, etc.) */
  header: ReactNode;
  children: ReactNode;
  /** Max width of main content area */
  maxWidth?: "2xl" | "4xl";
  className?: string;
}

export function AppShell({ header, children, maxWidth = "4xl", className }: AppShellProps) {
  const maxWidthClass = maxWidth === "2xl" ? "max-w-2xl" : "max-w-4xl";

  return (
    <div className={cn("min-h-screen bg-background relative", className)}>
      <header className="bg-surface/80 backdrop-blur-xl border-b border-border sticky top-0 z-10">
        {header}
      </header>
      <main className={cn("container mx-auto px-4 py-6 relative animate-fade-in", maxWidthClass)}>
        {children}
      </main>
    </div>
  );
}
