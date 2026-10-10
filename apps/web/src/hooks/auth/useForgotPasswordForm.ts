"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@vefy/shared";
import { requestPasswordReset } from "@/lib/auth-client";
import { notify } from "@/lib/notify";
import { useT } from "@/lib/i18n";

export function useForgotPasswordForm() {
  const { t } = useT();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const result = await requestPasswordReset({
        email: data.email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (result.error) {
        notify.error(
          result.error.status === 429 ? t("auth.errorTooManyRequests") : t("auth.errorConnection"),
        );
        return;
      }
      setSentTo(data.email);
      notify.success(t("toast.resetEmailSent"));
    } catch {
      notify.error(t("auth.errorConnection"));
    } finally {
      setIsSubmitting(false);
    }
  });

  return { control, onSubmit, isSubmitting, sentTo };
}
