import { type ReactNode } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Input } from "@/components/core/atoms/Input";
import { cn } from "@/lib/utils";

interface InputNumberProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>;
  control: Control<TFieldValues>;
  thousandSeparator?: boolean;
  suffix?: ReactNode;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  id?: string;
}

export function InputNumber<TFieldValues extends FieldValues>({
  name,
  control,
  thousandSeparator = false,
  suffix,
  className,
  ...rest
}: InputNumberProps<TFieldValues>) {
  const { field } = useController({ name, control });

  const displayValue = (() => {
    if (field.value === undefined || field.value === null || field.value === "") return "";
    const n = Number(field.value);
    if (Number.isNaN(n)) return "";
    return thousandSeparator ? n.toLocaleString("vi-VN") : String(n);
  })();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    if (digitsOnly === "") {
      // Not undefined: React Hook Form would show the field's default value again
      field.onChange(null);
      return;
    }
    field.onChange(Number(digitsOnly));
  };

  const input = (
    <Input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      name={field.name}
      ref={field.ref}
      value={displayValue}
      onBlur={field.onBlur}
      onChange={handleChange}
      className={cn(suffix ? "pr-12" : undefined, className)}
    />
  );

  if (!suffix) return input;

  return (
    <div className="relative">
      {input}
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
        {suffix}
      </span>
    </div>
  );
}
