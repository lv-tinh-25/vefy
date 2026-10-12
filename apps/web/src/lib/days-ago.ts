import type { MessageKey } from "@/lib/i18n";

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

interface DaysAgoKeys {
  today: MessageKey;
  yesterday: MessageKey;
  days: MessageKey;
}

/** "today" / "yesterday" read better than "0 days" / "1 days" */
export function formatDaysAgo(days: number, t: Translate, keys: DaysAgoKeys): string {
  if (days <= 0) return t(keys.today);
  if (days === 1) return t(keys.yesterday);
  return t(keys.days, { days });
}

export const PART_INSTALLED_KEYS: DaysAgoKeys = {
  today: "parts.installedToday",
  yesterday: "parts.installedYesterday",
  days: "parts.installedDaysAgo",
};

export const OIL_CHANGED_KEYS: DaysAgoKeys = {
  today: "prediction.changedToday",
  yesterday: "prediction.changedYesterday",
  days: "prediction.daysSinceLast",
};
