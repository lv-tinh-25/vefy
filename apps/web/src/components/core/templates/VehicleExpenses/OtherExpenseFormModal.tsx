"use client";

import { Dialog } from "@/components/core/molecules/Dialog";
import { Button } from "@/components/core/atoms/Button";
import { useT } from "@/lib/i18n";
import { useOtherExpenseForm } from "@/hooks/vehicles/useOtherExpenseForm";
import { OtherExpenseFields } from "./OtherExpenseFields";

interface OtherExpenseFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => Promise<unknown> | void;
  vehicleId: string;
}

export function OtherExpenseFormModal({ open, onClose, onSuccess, vehicleId }: OtherExpenseFormModalProps) {
  const { t } = useT();
  const expenseForm = useOtherExpenseForm(vehicleId, onSuccess, onClose);
  const { loading, onSubmit } = expenseForm;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      busy={loading}
      title={t("expenseForm.title")}
      actions={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" form="other-expense-form" disabled={loading}>
            {loading ? t("common.saving") : t("common.save")}
          </Button>
        </>
      }
    >
      <form id="other-expense-form" onSubmit={onSubmit} className="space-y-4">
        <OtherExpenseFields {...expenseForm} />
      </form>
    </Dialog>
  );
}
