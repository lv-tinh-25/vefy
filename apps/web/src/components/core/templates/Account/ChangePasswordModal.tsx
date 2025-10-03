"use client";

import { Controller } from "react-hook-form";
import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { Label } from "@/components/core/atoms/Label";
import { PasswordInput } from "@/components/core/atoms/PasswordInput";
import { useT } from "@/lib/i18n";
import { useChangePassword } from "@/hooks/account/useChangePassword";
import { CheckCircle2 } from "lucide-react";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const { t, tRaw } = useT();
  const { control, onSubmit, error, success, isSubmitting } =
    useChangePassword(onClose);

  if (success) {
    return (
      <Dialog open={open} onClose={onClose} title={t("account.changePasswordTitle")}>
        <div className="flex flex-col items-center py-8 text-center animate-fade-in">
          <CheckCircle2 className="h-12 w-12 text-success mb-3" />
          <p className="text-foreground font-medium">{t("account.passwordChanged")}</p>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      busy={isSubmitting}
      title={t("account.changePasswordTitle")}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="change-password-form" disabled={isSubmitting}>
            {isSubmitting ? t("common.saving") : t("account.changePassword")}
          </Button>
        </>
      }
    >
      <form id="change-password-form" onSubmit={onSubmit} className="space-y-4">
        <Controller
          control={control}
          name="currentPassword"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <Label>{t("account.currentPassword")}</Label>
              <PasswordInput {...field} placeholder="••••••••" autoComplete="current-password" autoFocus />
              {fieldState.error && <p className="text-xs text-danger">{tRaw(fieldState.error.message)}</p>}
            </div>
          )}
        />
        <Controller
          control={control}
          name="newPassword"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <Label>{t("account.newPassword")}</Label>
              <PasswordInput {...field} placeholder={t("auth.passwordHint")} autoComplete="new-password" />
              {fieldState.error && <p className="text-xs text-danger">{tRaw(fieldState.error.message)}</p>}
            </div>
          )}
        />
        <Controller
          control={control}
          name="confirmNewPassword"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <Label>{t("account.confirmNewPassword")}</Label>
              <PasswordInput {...field} placeholder={t("auth.passwordHint")} autoComplete="new-password" />
              {fieldState.error && <p className="text-xs text-danger">{tRaw(fieldState.error.message)}</p>}
            </div>
          )}
        />
        {error && <p className="text-sm text-danger text-center">{tRaw(error)}</p>}
      </form>
    </Dialog>
  );
}
