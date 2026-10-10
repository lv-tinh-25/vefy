"use client";

import { useT } from "@/lib/i18n";
import { cn, CURRENCY_UNIT, formatNumber } from "@/lib/utils";

/** Amount with a smaller, muted currency unit */
export function Money({ amount, className }: { amount: number; className?: string }) {
  const { locale } = useT();
  return (
    <span className={cn("whitespace-nowrap tabular-nums", className)}>
      {formatNumber(Math.round(amount), locale)}
      <span className="ml-1 text-[0.75em] font-medium text-muted-foreground">{CURRENCY_UNIT[locale]}</span>
    </span>
  );
}
