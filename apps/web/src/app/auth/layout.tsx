"use client";

import type { ReactNode } from "react";
import { useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Globe, Sun, Moon } from "lucide-react";

const LOCALE_LABELS: Record<Locale, string> = { vi: "VI", en: "EN" };

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useT();
  const { theme, toggleTheme } = useTheme();
  const nextLocale: Locale = locale === "vi" ? "en" : "vi";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center h-8 w-8 text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-border hover:border-border-hover cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-3.5 w-3.5" />
          ) : (
            <Moon className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={() => setLocale(nextLocale)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1.5 rounded-lg border border-border hover:border-border-hover cursor-pointer"
        >
          <Globe className="h-3.5 w-3.5" />
          {LOCALE_LABELS[nextLocale]}
        </button>
      </div>
      {children}
    </div>
  );
}
