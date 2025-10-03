import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { TextLink } from "@/components/core/atoms/TextLink";
import { ArrowLeft } from "lucide-react";

export function BackToLoginLink({ className, disabled }: { className?: string; disabled?: boolean }) {
  const { t } = useT();

  return (
    <p className={cn("text-center text-sm", className)}>
      <TextLink href="/auth/login" className="inline-flex items-center gap-1.5" disabled={disabled}>
        <ArrowLeft className="h-4 w-4" />
        {t("auth.backToLogin")}
      </TextLink>
    </p>
  );
}
