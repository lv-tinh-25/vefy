"use client";

import { TextLink } from "@/components/core/atoms/TextLink";
import { Controller } from "react-hook-form";
import { useLoginForm } from "@/hooks/auth/useLoginForm";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/core/atoms/Button";
import { Input } from "@/components/core/atoms/Input";
import { Label } from "@/components/core/atoms/Label";
import { PasswordInput } from "@/components/core/atoms/PasswordInput";
import { Loader2, Mail } from "lucide-react";

export function LoginForm() {
  const { control, onSubmit, signInWithGoogle, isSubmitting, isGoogleLoading, isBusy } =
    useLoginForm();
  const { t, tRaw } = useT();

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-heading text-primary mb-2">
          {t("auth.loginTitle")}
        </h1>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
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
                />
              </div>
              {fieldState.error && (
                <p className="text-xs text-danger">{tRaw(fieldState.error.message)}</p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>{t("auth.password")}</Label>
                <TextLink href="/auth/forgot-password" className="text-xs" disabled={isBusy}>
                  {t("auth.forgotPassword")}
                </TextLink>
              </div>
              <PasswordInput
                {...field}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {fieldState.error && (
                <p className="text-xs text-danger">{tRaw(fieldState.error.message)}</p>
              )}
            </div>
          )}
        />

        <Button type="submit" className="w-full" disabled={isBusy}>
          {isSubmitting ? t("common.loading") : t("auth.login")}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-muted-foreground">
            {t("auth.orContinueWith")}
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={signInWithGoogle}
        disabled={isBusy}
      >
        {isGoogleLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        {t("auth.google")}
      </Button>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {t("auth.noAccount")}{" "}
        <TextLink href="/auth/register" disabled={isBusy}>
          {t("auth.register")}
        </TextLink>
      </p>
    </div>
  );
}
