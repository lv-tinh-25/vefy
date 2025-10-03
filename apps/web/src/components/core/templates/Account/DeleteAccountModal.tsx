"use client";

import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { Input } from "@/components/core/atoms/Input";
import { Label } from "@/components/core/atoms/Label";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/hooks/auth/useAuth";
import { useDeleteAccount } from "@/hooks/account/useDeleteAccount";
import { AlertTriangle } from "lucide-react";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ open, onClose }: DeleteAccountModalProps) {
  const { t, tRaw } = useT();
  const { profile } = useAuth();
  const email = profile?.email ?? "";
  const { emailInput, setEmailInput, isMatch, error, isSubmitting, onConfirm } =
    useDeleteAccount(email, onClose);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      busy={isSubmitting}
      title={t("account.deleteConfirmTitle")}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>{t("common.cancel")}</Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={!isMatch || isSubmitting}>
            {isSubmitting ? t("common.deleting") : t("account.deleteAccountAction")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-3 p-4 bg-danger-muted border border-danger/20 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">{t("account.deleteConfirmDesc")}</p>
        </div>
        <div className="space-y-1.5">
          <Label>{t("account.deleteConfirmHint")}</Label>
          <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder={email} autoComplete="off" autoFocus />
        </div>
        {error && <p className="text-sm text-danger text-center">{tRaw(error)}</p>}
      </div>
    </Dialog>
  );
}
