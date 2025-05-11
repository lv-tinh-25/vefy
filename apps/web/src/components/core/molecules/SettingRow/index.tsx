"use client";

import type { ComponentType, ReactNode, SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string } & SVGProps<SVGSVGElement>>;

interface SettingRowProps {
  icon?: IconComponent;
  label: string;
  description?: string;
  value?: string | ReactNode;
  action?: ReactNode;
  variant?: "default" | "danger";
  className?: string;
}

export function SettingRow({
  icon: Icon,
  label,
  description,
  value,
  action,
  variant = "default",
  className,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 py-3.5 px-4",
        className,
      )}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {Icon && (
          <Icon
            className={cn(
              "h-5 w-5 mt-0.5 shrink-0",
              variant === "danger" ? "text-danger" : "text-muted-foreground",
            )}
          />
        )}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              variant === "danger" ? "text-danger" : "text-foreground",
            )}
          >
            {label}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          )}
          {value && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {value}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SettingCard({
  title,
  children,
  variant = "default",
}: {
  title: string;
  children: ReactNode;
  variant?: "default" | "danger";
}) {
  return (
    <section className="space-y-2">
      <h2
        className={cn(
          "text-xs font-semibold uppercase tracking-wider px-1",
          variant === "danger" ? "text-danger" : "text-muted-foreground",
        )}
      >
        {title}
      </h2>
      <div
        className={cn(
          "bg-surface border rounded-xl divide-y divide-border overflow-hidden",
          variant === "danger" ? "border-danger/30" : "border-border",
        )}
      >
        {children}
      </div>
    </section>
  );
}
