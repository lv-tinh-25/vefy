"use client";

import { BellRing, Mail, Share } from "lucide-react";
import { SettingCard, SettingRow } from "@/components/core/molecules/SettingRow";
import { Button } from "@/components/core/atoms/Button";
import { useAuth } from "@/hooks/auth/useAuth";
import { useReminderSettings } from "@/hooks/account/useReminderSettings";
import { useT } from "@/lib/i18n";

export function RemindersSection() {
  const { t } = useT();
  const { profile } = useAuth();
  const {
    settings, support, permission, pushEnabled, pushAvailable, workerReady, busy,
    enablePush, disablePush, sendTest, setEmailReminders,
  } = useReminderSettings({ prepareWorker: true });

  if (!settings) return null;

  const pushDescription =
    support === "unsupported"
      ? t("notifications.pushUnsupported")
      : pushEnabled
        ? t("notifications.pushOnDesc")
        : permission === "denied"
          ? t("notifications.pushBlocked")
          : t("notifications.pushOffDesc");

  const pushAction =
    support !== "supported" ? null : pushEnabled ? (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={sendTest} disabled={busy !== null}>
          {t("notifications.sendTest")}
        </Button>
        <Button size="sm" variant="outline" onClick={disablePush} disabled={busy !== null}>
          {t("notifications.turnOff")}
        </Button>
      </div>
    ) : (
      <Button size="sm" onClick={enablePush} disabled={busy !== null || !workerReady}>
        {t("notifications.turnOn")}
      </Button>
    );

  return (
    <div id="reminders" className="scroll-mt-20">
      <SettingCard title={t("notifications.remindersTitle")}>
        {/* Hidden until VAPID keys are configured on the server, and until the browser check ran */}
        {pushAvailable && support !== null && (
          <div>
            <SettingRow
              icon={BellRing}
              label={t("notifications.pushLabel")}
              description={support === "ios-install" ? t("notifications.iosInstallDesc") : pushDescription}
              action={pushAction}
            />
            {support === "ios-install" && (
              <ol className="mx-4 mb-4 -mt-1 ml-12 space-y-1.5 text-xs text-foreground list-decimal list-inside">
                <li>
                  {t("notifications.iosStep1")}
                  <Share className="inline h-3.5 w-3.5 ml-1 -mt-0.5 text-primary" aria-hidden />
                </li>
                <li>{t("notifications.iosStep2")}</li>
                <li>{t("notifications.iosStep3")}</li>
              </ol>
            )}
          </div>
        )}
        <SettingRow
          icon={Mail}
          label={t("notifications.emailLabel")}
          description={
            settings.emailReminders
              ? t("notifications.emailOnDesc", { email: profile?.email ?? "" })
              : t("notifications.emailOffDesc")
          }
          action={
            <Button
              size="sm"
              variant={settings.emailReminders ? "outline" : "default"}
              onClick={() => setEmailReminders(!settings.emailReminders)}
              disabled={busy !== null}
            >
              {settings.emailReminders ? t("notifications.turnOff") : t("notifications.turnOn")}
            </Button>
          }
        />
      </SettingCard>
    </div>
  );
}
