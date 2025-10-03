import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  /** Block navigation while the surrounding form is submitting */
  disabled?: boolean;
}

export function TextLink({ disabled = false, className, children, ...props }: TextLinkProps) {
  return (
    <Link
      {...props}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
      className={cn(
        "text-primary hover:underline font-medium",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {children}
    </Link>
  );
}
