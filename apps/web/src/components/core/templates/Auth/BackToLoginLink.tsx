import Link from "next/link";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

export function BackToLoginLink({ className }: { className?: string }) {
  const { t } = useT();

  return (
    <p className={cn("text-center text-sm", className)}>
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("auth.backToLogin")}
      </Link>
    </p>
  );
}
