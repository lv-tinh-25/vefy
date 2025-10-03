"use client";

import { useSearchParams } from "next/navigation";
import { useResendVerification } from "@/hooks/auth/useResendVerification";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/core/atoms/Button";
import { Mail } from "lucide-react";
import { AuthNotice } from "./AuthNotice";
import { BackToLoginLink } from "./BackToLoginLink";

export function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const isFromLogin = searchParams.get("from") === "login";
  const { t } = useT();
  const { resend, cooldown, isSending, canResend } = useResendVerification(email);

  return (
    <AuthNotice
      icon={Mail}
      title={isFromLogin ? t("auth.unverifiedTitle") : t("auth.verifyEmailTitle")}
      description={
        isFromLogin ? t("auth.unverifiedDesc", { email }) : t("auth.verifyEmailDesc", { email })
      }
    >
      {!isFromLogin && <p className="text-sm text-faint mb-4">{t("auth.verifyEmailHint")}</p>}

      {email && (
        <Button type="button" variant="outline" className="w-full" onClick={resend} disabled={!canResend}>
          {isSending
            ? t("common.loading")
            : cooldown > 0
              ? t("auth.resendEmailIn", { seconds: cooldown })
              : t("auth.resendEmail")}
        </Button>
      )}

      <BackToLoginLink className="mt-6" />
    </AuthNotice>
  );
}
