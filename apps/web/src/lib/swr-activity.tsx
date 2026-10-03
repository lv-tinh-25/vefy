"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { SWRConfig, type Middleware } from "swr";

// Number of mounted SWR hooks that are refetching while already showing data
let backgroundCount = 0;
const listeners = new Set<() => void>();

function setCount(delta: number) {
  backgroundCount += delta;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const trackBackgroundRevalidation: Middleware = (useSWRNext) => (key, fetcher, config) => {
  const swr = useSWRNext(key, fetcher, config);
  // First loads already render skeletons/spinners; only refetches over existing data need a hint
  const background = swr.isValidating && swr.data !== undefined;
  useEffect(() => {
    if (!background) return;
    setCount(1);
    return () => setCount(-1);
  }, [background]);
  return swr;
};

export function SWRActivityProvider({ children }: { children: ReactNode }) {
  return <SWRConfig value={{ use: [trackBackgroundRevalidation] }}>{children}</SWRConfig>;
}

export function useBackgroundRevalidating() {
  return useSyncExternalStore(subscribe, () => backgroundCount > 0, () => false);
}
