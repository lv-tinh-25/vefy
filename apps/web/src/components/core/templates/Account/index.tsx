"use client";

import { useAuth } from "@/hooks/auth/useAuth";
import { useT } from "@/lib/i18n";
import { PageSpinner } from "@/components/core/atoms/Spinner";
import { ProfileSection } from "./ProfileSection";
import { PreferencesSection } from "./PreferencesSection";
import { RemindersSection } from "./RemindersSection";
import { SecuritySection } from "./SecuritySection";
import { DangerSection } from "./DangerSection";

export function AccountContent() {
  const { profile } = useAuth();
  const { t } = useT();

  if (!profile) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading text-foreground">
        {t("account.title")}
      </h1>

      <ProfileSection />
      <RemindersSection />
      <PreferencesSection />
      <SecuritySection />
      <DangerSection />
    </div>
  );
}
