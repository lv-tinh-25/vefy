"use client";

import { Button } from "@/components/core/atoms/Button";
import { useT } from "@/lib/i18n";
import type { StatsPeriod } from "@vefy/shared";

interface PeriodToggleProps {
  value: StatsPeriod;
  onChange: (value: StatsPeriod) => void;
}

export function PeriodToggle({ value, onChange }: PeriodToggleProps) {
  const { t } = useT();
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={value === "month" ? "default" : "outline"}
        size="sm"
        aria-pressed={value === "month"}
        onClick={() => onChange("month")}
      >
        {t("expenses.periodMonth")}
      </Button>
      <Button
        type="button"
        variant={value === "year" ? "default" : "outline"}
        size="sm"
        aria-pressed={value === "year"}
        onClick={() => onChange("year")}
      >
        {t("expenses.periodYear")}
      </Button>
    </div>
  );
}
