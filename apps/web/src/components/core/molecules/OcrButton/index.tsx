"use client";

import { useOcrReader } from "@/hooks/ocr/useOcrReader";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/core/atoms/Button";
import { Camera, Loader2 } from "lucide-react";

interface OcrButtonProps {
  onResult: (km: number) => void;
}

export function OcrButton({ onResult }: OcrButtonProps) {
  const { t } = useT();
  const { fileRef, openPicker, handleFile, loading, cooldown, limitReached, disabled } =
    useOcrReader(onResult);

  const label = limitReached
    ? t("ocr.limitReachedButton")
    : cooldown > 0
      ? t("ocr.retryIn", { seconds: cooldown })
      : t("ocr.capture");

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <Button type="button" variant="outline" size="sm" onClick={openPicker} disabled={disabled}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        <span className="ml-1">{label}</span>
      </Button>
    </>
  );
}
