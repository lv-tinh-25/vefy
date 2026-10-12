"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { Droplets, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n";
import { useVehicle } from "@/hooks/vehicles/useVehicle";

const subTabs: { href: string; labelKey: MessageKey; icon: typeof Droplets }[] = [
  { href: "oil", labelKey: "nav.oil", icon: Droplets },
  { href: "parts", labelKey: "nav.parts", icon: Wrench },
];

export function MaintenanceShell({ children }: { children: ReactNode }) {
  const id = String(useParams().id);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useT();
  const { data: vehicle } = useVehicle(id);
  const isElectric = vehicle?.variant === "electric";
  const oilHref = `/vehicle/${id}/maintenance/oil`;

  useEffect(() => {
    if (isElectric && pathname === oilHref) router.replace(`/vehicle/${id}/maintenance/parts`);
  }, [isElectric, pathname, oilHref, id, router]);

  // Electric motorcycles only have parts, so a single-option switcher would be noise
  if (isElectric) return children;

  return (
    <div className="space-y-6">
      <nav className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface p-1">
        {subTabs.map((tab) => {
          const href = `/vehicle/${id}/maintenance/${tab.href}`;
          const isActive = pathname === href;
          return (
            <Link
              key={tab.href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors",
                isActive ? "bg-primary-muted text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <tab.icon className="h-4 w-4" />
              {t(tab.labelKey)}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
