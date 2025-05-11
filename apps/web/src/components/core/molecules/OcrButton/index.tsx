"use client";

import { useRef, useState } from "react";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/core/atoms/Button";
import { Camera, Loader2 } from "lucide-react";
import { resizeImage } from "@/lib/image-utils";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface OcrButtonProps {
  onResult: (km: number) => void;
}

export function OcrButton({ onResult }: OcrButtonProps) {
  const { t } = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // Larger image (2048px) for better odometer readability
      const imageBase64 = await resizeImage(file, 2048);
      const res = await api.api.ocr["read-odometer"].$post({
        json: { imageBase64 },
      });
      const result = await res.json();

      if ("success" in result && result.success && "km" in result && result.km) {
        onResult(result.km);
        toast.success(t("ocr.success", { km: result.km.toLocaleString() }));
      } else {
        toast.error(t("ocr.fail"));
      }
    } catch {
      toast.error(t("ocr.error"));
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        <span className="ml-1">{t("ocr.capture")}</span>
      </Button>
    </>
  );
}
