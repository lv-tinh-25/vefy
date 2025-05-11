import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Locale } from "@/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const localeMap: Record<Locale, string> = {
  vi: "vi-VN",
  en: "en-US",
};

export function formatDate(dateStr: string | null, locale: Locale = "vi"): string {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString(localeMap[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatNumber(n: number, locale: Locale = "vi"): string {
  return n.toLocaleString(localeMap[locale]);
}

export function formatCurrency(amount: number, locale: Locale = "vi"): string {
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
