"use client";

import { VEHICLE_COLORS, type VehicleColorKey } from "@vefy/shared";
import { useT, type MessageKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const COLOR_LABELS: Record<VehicleColorKey, MessageKey> = {
  white: "colors.white",
  black: "colors.black",
  silver: "colors.silver",
  gray: "colors.gray",
  red: "colors.red",
  blue: "colors.blue",
  green: "colors.green",
  brown: "colors.brown",
  orange: "colors.orange",
  yellow: "colors.yellow",
};

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const { t } = useT();

  return (
    <div className="flex flex-wrap gap-2">
      {VEHICLE_COLORS.map((color) => (
        <button
          key={color.name}
          type="button"
          onClick={() => onChange(color.name)}
          className={cn(
            "h-8 w-8 rounded-full border-2 transition-all duration-200",
            value === color.name
              ? "border-primary ring-2 ring-primary/30 scale-110"
              : "border-border hover:border-border-hover hover:scale-105",
          )}
          style={{ backgroundColor: color.hex }}
          title={t(COLOR_LABELS[color.key])}
          aria-label={t(COLOR_LABELS[color.key])}
        />
      ))}
    </div>
  );
}
