"use client";

import { Card, CardContent } from "@/components/core/molecules/Card";
import { useT } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { sumForPeriod, type Expense } from "@vefy/shared";

interface SummaryCardsProps {
  expenses: Expense[];
}

export function SummaryCards({ expenses }: SummaryCardsProps) {
  const { t, locale } = useT();
  const today = new Date().toISOString().slice(0, 10);
  const monthKey = today.slice(0, 7);
  const yearKey = today.slice(0, 4);
  const totalMonth = sumForPeriod(expenses, "month", monthKey);
  const totalYear = sumForPeriod(expenses, "year", yearKey);

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{t("expenses.totalMonth")}</p>
          <p className="text-lg font-semibold text-foreground mt-1">
            {formatCurrency(totalMonth, locale)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{t("expenses.totalYear")}</p>
          <p className="text-lg font-semibold text-foreground mt-1">
            {formatCurrency(totalYear, locale)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
