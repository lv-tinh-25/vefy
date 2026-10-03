"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import type { MessageKey } from "@/lib/i18n";
import { AppShell } from "@/components/core/molecules/AppShell";
import { UserMenu } from "@/components/core/molecules/UserMenu";
import { ArrowLeft, LayoutDashboard, FileText, Droplets, Wrench, Coins } from "lucide-react";
import type { ReactNode } from "react";

const tabs: { href: string; labelKey: MessageKey; icon: typeof LayoutDashboard }[] = [
  { href: "overview", labelKey: "nav.overview", icon: LayoutDashboard },
  { href: "documents", labelKey: "nav.documents", icon: FileText },
  { href: "oil", labelKey: "nav.oil", icon: Droplets },
  { href: "parts", labelKey: "nav.parts", icon: Wrench },
  { href: "expenses", labelKey: "nav.expenses", icon: Coins },
];

export function VehicleShell({ children }: { children: ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const id = String(params.id);
  const { t } = useT();

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
                const href = `/vehicle/${id}/${tab.href}`;
                const isActive = pathname === href;
                return (
                  <Link
                    key={tab.href}
                    href={href}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 transition-all duration-200",
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden min-[400px]:inline">{t(tab.labelKey)}</span>
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
