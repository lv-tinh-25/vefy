"use client";

import { AvatarUpload } from "@/components/core/molecules/AvatarUpload";
import { useT } from "@/lib/i18n";
import { ImagePlus } from "lucide-react";

interface VehiclePhotoFieldProps {
  /** Stored URL, a data URL awaiting upload, or "" for none */
  value: string;
  onChange: (value: string) => void;
}

export function VehiclePhotoField({ value, onChange }: VehiclePhotoFieldProps) {
  const { t } = useT();
  return (
    <div className="flex items-center gap-4">
      <AvatarUpload
        value={value}
        onChange={onChange}
        shape="rounded"
        size="lg"
        maxDimension={480}
        alt={t("vehicleForm.photo")}
        removeLabel={t("vehicleForm.removePhoto")}
        placeholder={<ImagePlus className="h-7 w-7 text-primary/70" />}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">
          {t("vehicleForm.photo")} <span className="font-normal text-muted-foreground">({t("common.optional")})</span>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {value ? t("vehicleForm.photoHintChange") : t("vehicleForm.photoHintAdd")}
        </p>
      </div>
    </div>
  );
}
