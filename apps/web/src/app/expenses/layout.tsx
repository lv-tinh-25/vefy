"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { AppShell } from "@/components/core/molecules/AppShell";
import { UserMenu } from "@/components/core/molecules/UserMenu";
import { ArrowLeft } from "lucide-react";

export default function ExpensesLayout({ children }: { children: ReactNode }) {
  const { t } = useT();

  return (
    <AppShell
      maxWidth="2xl"
      header={
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/garage"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("nav.garage")}
          </Link>
          <UserMenu />
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
