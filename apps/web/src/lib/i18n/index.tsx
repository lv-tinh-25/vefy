"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { vi } from "./messages/vi";
import { en } from "./messages/en";
import type { Locale, Messages, MessageKey } from "./types";

export type { Locale, MessageKey };

/* ── Dictionary registry ────────────────────────────────────────── */

const dictionaries: Record<Locale, Messages> = { vi, en };

/* ── Helpers ─────────────────────────────────────────────────────── */

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : path;
}

function interpolate(
  template: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return template;
  return Object.entries(params).reduce(
    (str, [key, val]) => str.replaceAll(`{${key}}`, String(val)),
    template,
  );
}

/* ── Context ─────────────────────────────────────────────────────── */

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
  tRaw: (str: string | undefined) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/* ── Provider ────────────────────────────────────────────────────── */

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
}

export function I18nProvider({
  children,
  defaultLocale = "vi",
}: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const messages = dictionaries[locale];

  // Sync from localStorage after hydration
  useEffect(() => {
    const saved = localStorage.getItem("vefy-locale");
    if (saved === "vi" || saved === "en") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("vefy-locale", newLocale);
  }, []);

  const t = useCallback(
    (key: MessageKey, params?: Record<string, string | number>): string => {
      const value = getNestedValue(
        messages as unknown as Record<string, unknown>,
        key,
      );
      return interpolate(value, params);
    },
    [messages],
  );

  const tRaw = useCallback(
    (str: string | undefined): string => {
      if (!str) return "";
      return getNestedValue(
        messages as unknown as Record<string, unknown>,
        str,
      );
    },
    [messages],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tRaw }}>
      {children}
    </I18nContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────────── */

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within <I18nProvider>");
  return ctx;
}
