"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";
import {
  getCurrentSubscription,
  getPermission,
  getPushSupport,
  prepareServiceWorker,
  subscribeToPush,
  type PushSupport,
} from "@/lib/web-push";

type Busy = "push" | "test" | "email" | null;

/** `prepareWorker`: register the service worker up front (only where the "Turn on" button lives) */
export function useReminderSettings({ prepareWorker = false } = {}) {
  const { t } = useT();
  const { data: settings, mutate } = useSWR("notification-settings", async () => {
    const res = await api.api.notifications.settings.$get();
    if (!res.ok) throw new Error("Failed to fetch notification settings");
    return res.json();
  });

  // Browser-only facts, read after mount so server and client render the same markup
  const [support, setSupport] = useState<PushSupport | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const registration = useRef<ServiceWorkerRegistration | null>(null);
  const [workerReady, setWorkerReady] = useState(false);

  useEffect(() => {
    const pushSupport = getPushSupport();
    setSupport(pushSupport);
    setPermission(getPermission());
    if (pushSupport !== "supported") return;
    getCurrentSubscription()
      .then((sub) => setEndpoint(sub?.endpoint ?? null))
      .catch(() => setEndpoint(null));
    if (!prepareWorker) return;
    prepareServiceWorker()
      .then((reg) => {
        registration.current = reg;
        setWorkerReady(true);
      })
      .catch((err) => console.error("[push] service worker registration failed", err));
  }, [prepareWorker]);

  const enablePush = async () => {
    if (!settings?.vapidPublicKey || !registration.current) return;
    // Started before any await so Safari still sees the tap (see subscribeToPush)
    const subscribing = subscribeToPush(registration.current, settings.vapidPublicKey);
    setBusy("push");
    try {
      const sub = await subscribing;
      setPermission(getPermission());
      const { keys } = sub.toJSON();
      const res = await api.api.notifications.push.subscribe.$post({
        json: { endpoint: sub.endpoint, keys: { p256dh: keys?.p256dh ?? "", auth: keys?.auth ?? "" } },
      });
      if (!res.ok) {
        await sub.unsubscribe();
        notify.error(t("toast.saveFailed"));
        return;
      }
      setEndpoint(sub.endpoint);
      notify.success(t("notifications.pushEnabled"));
    } catch (err) {
      console.error("[push] enable failed", err);
      const name = err instanceof Error ? err.name : "Error";
      setPermission(getPermission());
      // Chrome reports a refused prompt as AbortError, Safari as NotAllowedError
      if (getPermission() === "denied" || name === "NotAllowedError") notify.error(t("notifications.permissionDenied"));
      // The error name tells a real device apart from e.g. a simulator without a push service
      else notify.error(t("notifications.pushEnableFailedWithCode", { code: name }));
    } finally {
      setBusy(null);
    }
  };

  const disablePush = async () => {
    setBusy("push");
    try {
      const sub = await getCurrentSubscription();
      if (sub) {
        await api.api.notifications.push.unsubscribe.$post({ json: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setEndpoint(null);
      notify.success(t("notifications.pushDisabled"));
    } catch {
      notify.error(t("auth.errorConnection"));
    } finally {
      setBusy(null);
    }
  };

  const sendTest = async () => {
    if (!endpoint) return;
    setBusy("test");
    try {
      const res = await api.api.notifications.push.test.$post({ json: { endpoint } });
      if (res.ok) notify.success(t("notifications.testSent"));
      else notify.error(t("notifications.testFailed"));
    } catch {
      notify.error(t("auth.errorConnection"));
    } finally {
      setBusy(null);
    }
  };

  const setEmailReminders = async (emailReminders: boolean) => {
    setBusy("email");
    try {
      const res = await api.api.notifications.settings.$patch({ json: { emailReminders } });
      if (!res.ok) {
        notify.error(t("toast.saveFailed"));
        return;
      }
      await mutate();
      notify.success(t(emailReminders ? "notifications.emailEnabled" : "notifications.emailDisabled"));
    } catch {
      notify.error(t("auth.errorConnection"));
    } finally {
      setBusy(null);
    }
  };

  return {
    settings,
    support,
    permission,
    pushEnabled: endpoint !== null,
    pushAvailable: Boolean(settings?.vapidPublicKey),
    workerReady,
    busy,
    enablePush,
    disablePush,
    sendTest,
    setEmailReminders,
  };
}
