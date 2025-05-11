"use client";

import { VEHICLE_COLORS } from "@vefy/shared";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
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
          title={color.name}
        />
      ))}
    </div>
  );
}
