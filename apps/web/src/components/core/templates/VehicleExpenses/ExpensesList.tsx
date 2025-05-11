"use client";

import { Card, CardContent } from "@/components/core/molecules/Card";
import { Button } from "@/components/core/atoms/Button";
import { Badge } from "@/components/core/atoms/Badge";
import { useT } from "@/lib/i18n";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Expense } from "@vefy/shared";
import { Trash2 } from "lucide-react";

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
          <Card key={expense.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm text-foreground">{expense.name}</h4>
                    <Badge variant={expense.category === "part" ? "default" : "warning"}>
                      {t(expense.category === "part" ? "category.part" : "category.other")}
                    </Badge>
                  </div>
                  <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>{formatDate(expense.date, locale)}</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(expense.amount, locale)}
                    </span>
                  </div>
                  {expense.note && <p className="text-xs text-faint mt-1">{expense.note}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={linked}
                  title={linked ? t("expenses.linkedReadonly") : undefined}
                  onClick={() => onDelete(expense)}
                  className={
                    linked
                      ? "text-faint/40 cursor-not-allowed shrink-0"
                      : "text-faint hover:text-danger shrink-0"
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
