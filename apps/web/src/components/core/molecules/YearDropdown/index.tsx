import { useMemo } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { SearchableSelect } from "@/components/core/atoms/SearchableSelect";
import { useT } from "@/lib/i18n";

interface YearDropdownProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
  className?: string;
}

export function YearDropdown<TFieldValues extends FieldValues>({
  name,
  control,
  minYear,
  maxYear,
  placeholder,
  className,
}: YearDropdownProps<TFieldValues>) {
  const { t } = useT();
  const { field } = useController({ name, control });

  const currentYear = new Date().getFullYear();
  const max = maxYear ?? currentYear + 1;
  const min = minYear ?? currentYear - 50;

  const options = useMemo(() => {
    const list: string[] = [];
    for (let y = max; y >= min; y--) list.push(String(y));
    return list;
  }, [max, min]);

  const value =
    field.value === undefined || field.value === null ? "" : String(field.value);

  return (
    <SearchableSelect
      searchable={false}
      options={options}
      value={value}
      onChange={(v) => field.onChange(v === "" ? undefined : Number(v))}
      placeholder={placeholder ?? t("common.selectYear")}
      className={className}
    />
  );
}
