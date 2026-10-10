"use client";

import { IconButton } from "@/components/core/atoms/IconButton";
import { RecordItem } from "@/components/core/molecules/RecordItem";
import { Badge } from "@/components/core/atoms/Badge";
import { useT } from "@/lib/i18n";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Expense } from "@vefy/shared";
import { Droplets, Receipt, Trash2, Wrench } from "lucide-react";

interface ExpensesListProps {
  expenses: Expense[];
  onDelete: (expense: Expense) => void;
}

export function ExpensesList({ expenses, onDelete }: ExpensesListProps) {
  const { t, locale } = useT();

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-faint">{t("expenses.empty")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
        const linked = Boolean(expense.oilChangeId || expense.partId);
        return (
          <RecordItem
            key={expense.id}
            icon={expense.oilChangeId ? Droplets : expense.partId ? Wrench : Receipt}
            title={
              expense.oilChangeId
                ? t("expenses.oilChangeName", {
                    kind: t(`oilKinds.${expense.oilKind ?? "engine"}`).toLocaleLowerCase(locale),
                  })
                : expense.name
            }
            badge={
              <Badge variant={expense.category === "part" ? "default" : "warning"}>
                {t(expense.category === "part" ? "category.part" : "category.other")}
              </Badge>
            }
            meta={[formatDate(expense.date, locale)]}
            details={[expense.note]}
            amount={formatCurrency(expense.amount, locale)}
            action={
              <IconButton
                icon={Trash2}
                tone="danger"
                label={t("common.delete")}
                title={linked ? t("expenses.linkedReadonly") : undefined}
                disabled={linked}
                onClick={() => onDelete(expense)}
              />
            }
          />
        );
      })}
    </div>
  );
}
