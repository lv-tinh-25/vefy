"use client";

import { Card, CardContent } from "@/components/core/molecules/Card";
import { useT } from "@/lib/i18n";
import { Money } from "@/components/core/atoms/Money";
import { sumForPeriod, type Expense, todayDateStr } from "@vefy/shared";

interface SummaryCardsProps {
  expenses: Expense[];
}

export function SummaryCards({ expenses }: SummaryCardsProps) {
  const { t } = useT();
  const today = todayDateStr();
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
            <Money amount={totalMonth} />
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">{t("expenses.totalYear")}</p>
          <p className="text-lg font-semibold text-foreground mt-1">
            <Money amount={totalYear} />
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
