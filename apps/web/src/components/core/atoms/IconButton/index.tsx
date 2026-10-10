import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: LucideIcon;
  /** Accessible name; also the tooltip unless `title` is given */
  label: string;
  tone?: "neutral" | "danger";
  size?: "sm" | "md";
}

const toneStyles = {
  neutral: "text-muted-foreground hover:text-foreground hover:border-border-hover hover:bg-elevated",
  danger: "text-danger hover:border-danger/50 hover:bg-danger-muted",
};

const sizeStyles = {
  sm: { button: "h-7 w-7", icon: "h-3.5 w-3.5" },
  md: { button: "h-9 w-9", icon: "h-4 w-4" },
};

/** A bordered square so icon-only actions read as buttons */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, label, tone = "neutral", size = "md", title, type = "button", className, ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={title ?? label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-surface transition-colors cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // No pointer-events-none when disabled: the title still explains why
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface disabled:hover:border-border",
        toneStyles[tone],
        sizeStyles[size].button,
        className,
      )}
      {...props}
    >
      <Icon className={sizeStyles[size].icon} />
    </button>
  ),
);

IconButton.displayName = "IconButton";
