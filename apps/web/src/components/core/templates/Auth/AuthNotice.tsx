import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthNoticeProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "primary" | "danger";
  children?: ReactNode;
}

export function AuthNotice({ icon: Icon, title, description, tone = "primary", children }: AuthNoticeProps) {
  return (
    <div className="w-full max-w-sm mx-auto text-center animate-fade-in">
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl mx-auto mb-6",
          tone === "danger" ? "bg-danger-muted" : "bg-primary-muted",
        )}
      >
        <Icon className={cn("h-8 w-8", tone === "danger" ? "text-danger" : "text-primary")} />
      </div>

      <h1 className="text-2xl font-bold font-heading text-foreground mb-3">{title}</h1>

      <p className="text-muted-foreground mb-6">{description}</p>

      {children}
    </div>
  );
}
