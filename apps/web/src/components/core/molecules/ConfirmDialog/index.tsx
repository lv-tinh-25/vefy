"use client";

import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { useT } from "@/lib/i18n";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  loading,
}: ConfirmDialogProps) {
  const { t } = useT();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      busy={loading}
      actions={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? t("common.deleting") : t("common.delete")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{description}</p>
    </Dialog>
  );
}
