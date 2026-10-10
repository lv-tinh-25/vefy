"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/core/molecules/Card";
import { SearchableSelect } from "@/components/core/atoms/SearchableSelect";
import { PageSpinner } from "@/components/core/atoms/Spinner";
import { SummaryCards } from "@/components/core/templates/VehicleExpenses/SummaryCards";
import { PeriodToggle } from "@/components/core/templates/VehicleExpenses/PeriodToggle";
import { ExpensesChart } from "@/components/core/templates/VehicleExpenses/ExpensesChart";
import { ExpensesList } from "@/components/core/templates/VehicleExpenses/ExpensesList";
import { useAllExpenses } from "@/hooks/expenses/useAllExpenses";
import { useAllExpenseSummary } from "@/hooks/expenses/useAllExpenseSummary";
import { useGaragePage } from "@/hooks/garage/useGaragePage";
import { useT } from "@/lib/i18n";
import {
  groupExpensesByPeriod,
  type Expense,
  type StatsPeriod,
} from "@vefy/shared";

const ALL = "__all__";

export function ExpensesContent() {
  const { t } = useT();
  const [period, setPeriod] = useState<StatsPeriod>("month");
  const [vehicleFilter, setVehicleFilter] = useState<string>(ALL);

  const { data: expenses } = useAllExpenses();
  const { data: summaryAll } = useAllExpenseSummary(period);
  const { vehicles } = useGaragePage();

  const vehicleOptions = useMemo(() => {
    const all = [t("expenses.allVehicles")];
    if (!vehicles) return all;
    return [
      t("expenses.allVehicles"),
      ...vehicles.map((v) => `${v.name} (${v.licensePlate})`),
    ];
  }, [t, vehicles]);

  const vehicleByLabel = useMemo(() => {
    const map = new Map<string, string>();
    if (!vehicles) return map;
    for (const v of vehicles) {
      map.set(`${v.name} (${v.licensePlate})`, v.id);
    }
    return map;
  }, [vehicles]);

  const selectedLabel =
    vehicleFilter === ALL
      ? t("expenses.allVehicles")
      : vehicles?.find((v) => v.id === vehicleFilter)
        ? `${vehicles.find((v) => v.id === vehicleFilter)!.name} (${vehicles.find((v) => v.id === vehicleFilter)!.licensePlate})`
        : t("expenses.allVehicles");

  const handleVehicleSelect = (label: string) => {
    if (label === t("expenses.allVehicles")) {
      setVehicleFilter(ALL);
    } else {
      const id = vehicleByLabel.get(label);
      setVehicleFilter(id ?? ALL);
    }
  };

  const filteredExpenses: Expense[] = useMemo(() => {
    if (!expenses) return [];
    if (vehicleFilter === ALL) return expenses;
    return expenses.filter((e) => e.vehicleId === vehicleFilter);
  }, [expenses, vehicleFilter]);

  const chartData = useMemo(() => {
    if (vehicleFilter === ALL) return summaryAll ?? [];
    return groupExpensesByPeriod(filteredExpenses, period);
  }, [vehicleFilter, summaryAll, filteredExpenses, period]);

  if (!expenses || !summaryAll) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold font-heading text-foreground">
          {t("expenses.title")}
        </h1>
      </div>

      <SummaryCards expenses={filteredExpenses} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-base">
            {t("expenses.chartTitle")}
          </CardTitle>
          <PeriodToggle value={period} onChange={setPeriod} />
        </CardHeader>
        <CardContent className="space-y-3">
          <SearchableSelect
            value={selectedLabel}
            onChange={handleVehicleSelect}
            options={vehicleOptions}
            placeholder={t("expenseForm.selectVehicle")}
          />
          <ExpensesChart data={chartData} period={period} />
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          {t("expenses.history")}
        </h3>
        <ExpensesList
          expenses={filteredExpenses}
          onDelete={() => {
            /* Delete handled per-vehicle tab */
          }}
        />
      </div>
    </div>
  );
}
