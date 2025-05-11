"use client";

import { useT } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { SettingCard, SettingRow } from "@/components/core/molecules/SettingRow";
import { Button } from "@/components/core/atoms/Button";
import { Globe, Sun, Moon } from "lucide-react";

const LOCALE_LABELS: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

export function PreferencesSection() {
  const { t, locale, setLocale } = useT();
  const { theme, toggleTheme } = useTheme();

  const toggleLocale = () => {
    setLocale(locale === "vi" ? "en" : "vi");
  };

  return (
    <SettingCard title={t("account.preferences")}>
      <SettingRow
        icon={Globe}
        label={t("account.language")}
        value={LOCALE_LABELS[locale]}
        action={
          <Button size="sm" variant="outline" onClick={toggleLocale}>
            {t("account.change")}
          </Button>
        }
      />
      <SettingRow
        icon={theme === "dark" ? Moon : Sun}
        label={t("account.theme")}
        value={theme === "dark" ? t("account.themeDark") : t("account.themeLight")}
        action={
          <Button size="sm" variant="outline" onClick={toggleTheme}>
            {t("account.change")}
          </Button>
        }
      />
    </SettingCard>
  );
}
