"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n";
import { AppShell } from "@/components/core/molecules/AppShell";
import { UserMenu } from "@/components/core/molecules/UserMenu";
import { useVehicle } from "@/hooks/vehicles/useVehicle";
import { ArrowLeft, LayoutDashboard, FileText, Wrench, Coins } from "lucide-react";
import type { ReactNode } from "react";

const tabs: { href: string; labelKey: MessageKey; icon: typeof LayoutDashboard }[] = [
  { href: "overview", labelKey: "nav.overview", icon: LayoutDashboard },
  { href: "documents", labelKey: "nav.documents", icon: FileText },
  { href: "maintenance", labelKey: "nav.maintenance", icon: Wrench },
  { href: "expenses", labelKey: "nav.expenses", icon: Coins },
];

export function VehicleShell({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const id = String(params.id);
  const { t } = useT();
  const { data: vehicle } = useVehicle(id);
  const maintenanceHref = `maintenance/${vehicle?.variant === "electric" ? "parts" : "oil"}`;

  return (
    <AppShell
      header={
        <>
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <Link
              href="/garage"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("nav.garage")}
            </Link>
            <UserMenu />
          </div>
          <div className="container mx-auto px-4">
            <nav className="flex">
              {tabs.map((tab) => {
                const base = `/vehicle/${id}/${tab.href}`;
                const href = tab.href === "maintenance" ? `/vehicle/${id}/${maintenanceHref}` : base;
                const isActive = pathname === base || pathname.startsWith(`${base}/`);
                return (
                  <Link
                    key={tab.href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] leading-none font-medium whitespace-nowrap border-b-2 transition-all duration-200 sm:flex-row sm:gap-1.5 sm:py-2.5 sm:text-sm",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{t(tab.labelKey)}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      }
    >
      {children}
    </AppShell>
  );
}
