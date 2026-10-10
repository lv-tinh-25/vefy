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
import { fillChartPeriods, type ExpenseSummary, type StatsPeriod } from "@vefy/shared";
import { useT } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

interface ExpensesChartProps {
  data: ExpenseSummary[];
  period: StatsPeriod;
}

function compactNumber(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${Math.round(v / 1_000)}k`;
  return String(v);
}

// Share of the tallest column a non-zero amount is drawn with at least, so a small month stays
// visible next to a huge one instead of rendering under a pixel tall. Tooltips show real amounts.
const MIN_VISIBLE_SHARE = 0.02;

type ChartRow = ExpenseSummary & { partBar: number; otherBar: number };

function toChartRows(summary: ExpenseSummary[]): ChartRow[] {
  const floor = Math.max(...summary.map((s) => s.total), 0) * MIN_VISIBLE_SHARE;
  const bar = (v: number) => (v > 0 ? Math.max(v, floor) : 0);
  return summary.map((s) => ({ ...s, partBar: bar(s.part), otherBar: bar(s.other) }));
}

export function ExpensesChart({ data, period }: ExpensesChartProps) {
  const { t, locale } = useT();

  const monthLabel = (key: string, style: "short" | "full") => {
    const [year, month] = key.split("-").map(Number);
    if (locale === "vi") return style === "short" ? `T${month}` : `Tháng ${month}/${year}`;
    return new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString("en-US", {
      month: "short",
      ...(style === "full" && { year: "numeric" }),
      timeZone: "UTC",
    });
  };
  const formatPeriod = (key: string, style: "short" | "full") =>
    period === "month" ? monthLabel(key, style) : key;

  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        {t("expenses.empty")}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={toChartRows(fillChartPeriods(data, period))} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 12 }}
          interval={0}
          tickFormatter={(key: string) => formatPeriod(key, "short")}
        />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={compactNumber} width={48} />
        <Tooltip
          formatter={(_value, name, item) => {
            const row = item.payload as ChartRow;
            return [formatCurrency(item.dataKey === "partBar" ? row.part : row.other, locale), name];
          }}
          labelFormatter={(key) => formatPeriod(String(key), "full")}
          labelClassName="text-foreground"
          contentStyle={{ fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="partBar" name={t("expenses.seriesPart")} stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="otherBar" name={t("expenses.seriesOther")} stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
