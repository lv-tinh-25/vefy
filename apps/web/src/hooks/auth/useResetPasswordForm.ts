"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordSchema, type ResetPasswordInput } from "@vefy/shared";
import { resetPassword } from "@/lib/auth-client";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export function useResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useT();
  const token = searchParams.get("token");
  const [isTokenInvalid, setIsTokenInvalid] = useState(
    !token || searchParams.get("error") !== null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const result = await resetPassword({ newPassword: data.newPassword, token });
      if (!result.error) {
        toast.success(t("auth.resetPasswordSuccess"));
        // Keep the form locked while navigating away
        router.push("/auth/login");
        return;
      }
      if (result.error.code === "INVALID_TOKEN") setIsTokenInvalid(true);
      else toast.error(t("auth.errorConnection"));
    } catch {
      toast.error(t("auth.errorConnection"));
    }
    setIsSubmitting(false);
  });

  return { control, onSubmit, isSubmitting, isTokenInvalid };
}
