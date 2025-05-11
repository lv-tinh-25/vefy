"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ExpenseSummary } from "@vefy/shared";
import { useT } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

interface ExpensesChartProps {
  data: ExpenseSummary[];
}

function compactNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
  return String(v);
}

export function ExpensesChart({ data }: ExpensesChartProps) {
  const { t, locale } = useT();

  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        {t("expenses.empty")}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={compactNumber} width={48} />
        <Tooltip
          formatter={(value) =>
            formatCurrency(typeof value === "number" ? value : Number(value) || 0, locale)
          }
          labelClassName="text-foreground"
          contentStyle={{ fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="part" name={t("expenses.seriesPart")} stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="other" name={t("expenses.seriesOther")} stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
