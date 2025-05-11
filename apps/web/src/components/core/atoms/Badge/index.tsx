import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "danger" | "warning" | "success" | "neutral";
}

const variantStyles: Record<string, string> = {
  default: "bg-primary-muted text-primary",
  danger: "bg-danger-muted text-danger",
  warning: "bg-warning-muted text-warning",
  success: "bg-success-muted text-success",
  neutral: "bg-neutral-muted text-neutral",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
