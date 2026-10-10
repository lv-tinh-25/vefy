"use client";

import { useEffect, useRef, useState } from "react";
import { notify } from "@/lib/notify";
import { api } from "@/lib/api";
import { resizeImage } from "@/lib/image-utils";
import { useT } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";

export function useOcrReader(onResult: (km: number) => void) {
  const { t, locale } = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const openPicker = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    try {
      // Larger image (2048px) for better odometer readability
      const imageBase64 = await resizeImage(file, 2048);
      const res = await api.api.ocr["read-odometer"].$post({ json: { imageBase64 } });

      if (res.status === 429) {
        const body = await res.json();
        if (body.code === "OCR_DAILY_LIMIT") {
          setLimitReached(true);
          notify.error(t("ocr.dailyLimit", { limit: body.limit }));
        } else {
          setCooldown(body.retryAfter);
          notify.error(t("ocr.cooldown", { seconds: body.retryAfter }));
        }
        return;
      }

      if (res.status === 503) {
        const body = await res.json();
        setCooldown(body.cooldownSeconds);
        notify.error(t("ocr.unavailable"));
        return;
      }

      if (!res.ok) {
        notify.error(t("ocr.error"));
        return;
      }

      const result = await res.json();
      setCooldown(result.cooldownSeconds);
      if (result.remaining <= 0) setLimitReached(true);

      if (result.success) {
        onResult(result.km);
        notify.success(
          t("ocr.success", { km: formatNumber(result.km, locale), remaining: result.remaining }),
        );
      } else {
        notify.error(t("ocr.fail", { remaining: result.remaining }));
      }
    } catch {
      notify.error(t("ocr.error"));
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return {
    fileRef,
    openPicker,
    handleFile,
    loading,
    cooldown,
    limitReached,
    disabled: loading || cooldown > 0 || limitReached,
  };
}
