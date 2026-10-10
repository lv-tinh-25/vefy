"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/core/atoms/Button";
import { PageSpinner } from "@/components/core/atoms/Spinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/core/molecules/Card";
import { ConfirmDialog } from "@/components/core/molecules/ConfirmDialog";
import { SummaryCards } from "./SummaryCards";
import { PeriodToggle } from "./PeriodToggle";
import { ExpensesChart } from "./ExpensesChart";
import { ExpensesList } from "./ExpensesList";
import { OtherExpenseFormModal } from "./OtherExpenseFormModal";
import { useVehicleExpenses } from "@/hooks/vehicles/useVehicleExpenses";
import { useVehicleExpenseSummary } from "@/hooks/vehicles/useVehicleExpenseSummary";
import { useT } from "@/lib/i18n";
import { api } from "@/lib/api";
import type { Expense, StatsPeriod } from "@vefy/shared";
import { Plus } from "lucide-react";

export function VehicleExpensesContent() {
  const params = useParams();
  const vehicleId = String(params.id);
  const { t } = useT();
  const [period, setPeriod] = useState<StatsPeriod>("month");
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: expenses, mutate: mutateList } = useVehicleExpenses(vehicleId);
  const { data: summary, mutate: mutateSummary } = useVehicleExpenseSummary(
    vehicleId,
    period,
  );

  const refresh = () => Promise.all([mutateList(), mutateSummary()]);

  if (!expenses || !summary) return <PageSpinner />;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.api.vehicles[":vehicleId"].expenses[":id"].$delete({
        param: { vehicleId, id: deleteTarget.id },
      });
      await refresh();
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <SummaryCards expenses={expenses} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t("expenses.chartTitle")}</CardTitle>
          <PeriodToggle value={period} onChange={setPeriod} />
        </CardHeader>
        <CardContent>
          <ExpensesChart data={summary} period={period} />
        </CardContent>
      </Card>

      <Button onClick={() => setShowForm(true)} className="w-full">
        <Plus className="h-4 w-4" />
        {t("expenses.addOther")}
      </Button>

      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">
          {t("expenses.history")}
        </h3>
        <ExpensesList expenses={expenses} onDelete={setDeleteTarget} />
      </div>

      {showForm && (
        <OtherExpenseFormModal
          open
          onClose={() => setShowForm(false)}
          onSuccess={refresh}
          vehicleId={vehicleId}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          open
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title={t("expenses.deleteTitle")}
          description={t("expenses.deleteConfirm")}
          loading={deleting}
        />
      )}
    </div>
  );
}
