"use client";

import { Controller } from "react-hook-form";
import { useForgotPasswordForm } from "@/hooks/auth/useForgotPasswordForm";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/core/atoms/Button";
import { Input } from "@/components/core/atoms/Input";
import { Label } from "@/components/core/atoms/Label";
import { Mail } from "lucide-react";
import { AuthNotice } from "./AuthNotice";
import { BackToLoginLink } from "./BackToLoginLink";

export function ForgotPasswordForm() {
  const { control, onSubmit, isSubmitting, sentTo } = useForgotPasswordForm();
  const { t, tRaw } = useT();

  if (sentTo) {
    return (
      <AuthNotice
        icon={Mail}
        title={t("auth.resetLinkSentTitle")}
        description={t("auth.resetLinkSentDesc", { email: sentTo })}
      >
        <p className="text-sm text-faint mb-6">{t("auth.verifyEmailHint")}</p>
        <BackToLoginLink />
      </AuthNotice>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-heading text-primary mb-2">
          {t("auth.forgotPasswordTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("auth.forgotPasswordDesc")}</p>
      </div>

      <form onSubmit={onSubmit}>
        <fieldset disabled={isSubmitting} className="min-w-0 space-y-4">
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label>{t("auth.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                  <Input
                    {...field}
                    type="email"
                    placeholder={t("auth.emailHint")}
                    className="pl-10"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {fieldState.error && (
                  <p className="text-xs text-danger">{tRaw(fieldState.error.message)}</p>
                )}
              </div>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("common.loading") : t("auth.sendResetLink")}
          </Button>
        </fieldset>
      </form>

      <BackToLoginLink className="mt-6" disabled={isSubmitting} />
    </div>
  );
}
