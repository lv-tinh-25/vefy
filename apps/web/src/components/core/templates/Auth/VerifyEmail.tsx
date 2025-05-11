"use client";

import { useSearchParams } from "next/navigation";
import { useT } from "@/lib/i18n";
import { Mail } from "lucide-react";

export function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { t } = useT();

  return (
    <div className="w-full max-w-sm mx-auto text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-muted mx-auto mb-6">
        <Mail className="h-8 w-8 text-primary" />
      </div>

      <h1 className="text-2xl font-bold font-heading text-foreground mb-3">
        {t("auth.verifyEmailTitle")}
      </h1>

      <p className="text-muted-foreground mb-6">
        {t("auth.verifyEmailDesc", { email })}
      </p>

      <p className="text-sm text-faint">{t("auth.verifyEmailHint")}</p>
    </div>
  );
}
