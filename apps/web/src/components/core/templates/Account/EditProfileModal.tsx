"use client";

import { Controller, useWatch } from "react-hook-form";
import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { Input } from "@/components/core/atoms/Input";
import { Label } from "@/components/core/atoms/Label";
import { AvatarUpload } from "@/components/core/molecules/AvatarUpload";
import { useT } from "@/lib/i18n";
import { useEditProfile } from "@/hooks/account/useEditProfile";
import { User } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { t, tRaw } = useT();
  const { control, onSubmit, error, isSubmitting } = useEditProfile(onClose);
  const watchedName = useWatch({ control, name: "name" });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      busy={isSubmitting}
      title={t("account.editProfileTitle")}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{t("common.cancel")}</Button>
          <Button type="submit" form="edit-profile-form" disabled={isSubmitting}>
            {isSubmitting ? t("common.saving") : t("common.saveChanges")}
          </Button>
        </>
      }
    >
      <form id="edit-profile-form" onSubmit={onSubmit} className="space-y-4">
        <Controller
          control={control}
          name="image"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <Label className="text-center block">{t("auth.avatar")}</Label>
              <div className="flex justify-center">
                <AvatarUpload value={field.value ?? ""} onChange={field.onChange} name={watchedName} alwaysShowOverlay />
              </div>
              {fieldState.error && <p className="text-xs text-danger text-center">{tRaw(fieldState.error.message)}</p>}
            </div>
          )}
        />
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <div className="space-y-1.5">
              <Label>{t("auth.name")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-faint" />
                <Input {...field} placeholder={t("auth.nameHint")} className="pl-10" autoFocus />
              </div>
              {fieldState.error && <p className="text-xs text-danger">{tRaw(fieldState.error.message)}</p>}
            </div>
          )}
        />
        {error && <p className="text-sm text-danger text-center">{t("auth.errorConnection")}</p>}
      </form>
    </Dialog>
  );
}
