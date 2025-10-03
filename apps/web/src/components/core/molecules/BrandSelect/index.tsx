"use client";

import { SearchableSelect } from "@/components/core/atoms/SearchableSelect";
import { useT } from "@/lib/i18n";
import { getBrandGroups, type VehicleType } from "@vefy/shared";
import { getBrandLabel } from "@/lib/brand-label";

interface BrandSelectProps {
  vehicleType: VehicleType;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function BrandSelect({ vehicleType, value, onChange, className }: BrandSelectProps) {
  const { t, tRaw } = useT();
  const groups = getBrandGroups(vehicleType);

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      groups={groups.map((g) => ({ label: tRaw(g.labelKey), options: g.brands }))}
      placeholder={t("vehicleForm.brandHint")}
      emptyMessage={t("vehicleForm.brandNotFound")}
      getOptionLabel={(brand) => getBrandLabel(brand, t)}
      className={className}
    />
  );
}
