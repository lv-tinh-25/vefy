"use client";

import { useEffect, useState } from "react";
import { sendVerificationEmail } from "@/lib/auth-client";
import { notify } from "@/lib/notify";
import { useT } from "@/lib/i18n";

const RESEND_COOLDOWN_SECONDS = 60;

export function useResendVerification(email: string) {
  const { t } = useT();
  const [cooldown, setCooldown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const resend = async () => {
    if (!email || cooldown > 0) return;
    setIsSending(true);
    try {
      const result = await sendVerificationEmail({ email });
      if (result.error) {
        notify.error(
          result.error.status === 429 ? t("auth.errorTooManyRequests") : t("auth.errorConnection"),
        );
        return;
      }
      notify.success(t("auth.resendEmailSuccess"));
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      notify.error(t("auth.errorConnection"));
    } finally {
      setIsSending(false);
    }
  };

  return { resend, cooldown, isSending, canResend: !!email && cooldown <= 0 && !isSending };
}
