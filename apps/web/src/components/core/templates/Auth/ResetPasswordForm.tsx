"use client";

import Link from "next/link";
import { Controller } from "react-hook-form";
import { useResetPasswordForm } from "@/hooks/auth/useResetPasswordForm";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/core/atoms/Button";
import { Label } from "@/components/core/atoms/Label";
import { PasswordInput } from "@/components/core/atoms/PasswordInput";
import { LinkIcon } from "lucide-react";
import { AuthNotice } from "./AuthNotice";
import { BackToLoginLink } from "./BackToLoginLink";

export function ResetPasswordForm() {
  const { control, onSubmit, isSubmitting, isTokenInvalid } = useResetPasswordForm();
  const { t, tRaw } = useT();

  if (isTokenInvalid) {
    return (
      <AuthNotice
        icon={LinkIcon}
        tone="danger"
        title={t("auth.resetLinkInvalidTitle")}
        description={t("auth.resetLinkInvalidDesc")}
      >
        <p className="text-sm mb-4">
          <Link href="/auth/forgot-password" className="text-primary hover:underline font-medium">
            {t("auth.requestNewLink")}
          </Link>
        </p>
        <BackToLoginLink />
      </AuthNotice>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-heading text-primary mb-2">
          {t("auth.resetPasswordTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">{t("auth.resetPasswordDesc")}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Controller
          control={control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <Label>{t("auth.newPassword")}</Label>
              <PasswordInput
                {...field}
                placeholder={t("auth.passwordHint")}
                autoComplete="new-password"
                autoFocus
              />
              {fieldState.error && (
                <p className="text-xs text-danger">{tRaw(fieldState.error.message)}</p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="confirmNewPassword"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <Label>{t("auth.confirmNewPassword")}</Label>
              <PasswordInput {...field} placeholder="••••••••" autoComplete="new-password" />
              {fieldState.error && (
                <p className="text-xs text-danger">{tRaw(fieldState.error.message)}</p>
              )}
            </div>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? t("common.loading") : t("auth.resetPassword")}
        </Button>
      </form>

      <BackToLoginLink className="mt-6" disabled={isSubmitting} />
    </div>
  );
}
