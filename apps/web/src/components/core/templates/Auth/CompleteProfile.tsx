"use client";

import { Controller, useWatch } from "react-hook-form";
import { useCompleteProfile } from "@/hooks/auth/useCompleteProfile";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/core/atoms/Button";
import { Input } from "@/components/core/atoms/Input";
import { Label } from "@/components/core/atoms/Label";
import { AvatarUpload } from "@/components/core/molecules/AvatarUpload";
import { Loader2, User } from "lucide-react";

export function CompleteProfile() {
  const { control, onSubmit, error, isSubmitting, isChecking } = useCompleteProfile();
  const { t, tRaw } = useT();
  const watchedName = useWatch({ control, name: "name" });

  if (isChecking) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-heading text-primary mb-2">
          {t("auth.completeProfileTitle")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("auth.completeProfileDesc")}
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <fieldset disabled={isSubmitting} className="min-w-0 space-y-5">
          {/* Avatar upload */}
          <Controller
            control={control}
            name="image"
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label className="text-center block">
                  {t("auth.avatar")}{" "}
                  <span className="text-faint">({t("common.optional")})</span>
                </Label>
                <div className="flex justify-center">
                  <AvatarUpload
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    name={watchedName}
                    size="lg"
                    alwaysShowOverlay
                  />
                </div>
                {fieldState.error && (
                  <p className="text-xs text-danger text-center">
                    {tRaw(fieldState.error.message)}
                  </p>
                )}
              </div>
            )}
          />

          {/* Name */}
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <div className="space-y-1.5">
                <Label>{t("auth.name")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                  <Input
                    {...field}
                    placeholder={t("auth.nameHint")}
                    className="pl-10"
                    autoFocus
                  />
                </div>
                {fieldState.error && (
                  <p className="text-xs text-danger">
                    {tRaw(fieldState.error.message)}
                  </p>
                )}
              </div>
            )}
          />

          {error && (
            <p className="text-sm text-danger text-center">
              {t("auth.errorConnection")}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? t("auth.completing") : t("auth.completeProfile")}
          </Button>
        </fieldset>
      </form>
    </div>
  );
}
