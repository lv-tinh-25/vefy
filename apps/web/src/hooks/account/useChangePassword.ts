"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@vefy/shared";
import { changePassword } from "@/lib/auth-client";
import { getAuthErrorKey } from "@/lib/auth-errors";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";

export function useChangePassword(onClose: () => void) {
  const { tRaw } = useT();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, setError: setFieldError } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      });
      if (result.error) {
        const key = getAuthErrorKey(result.error, "auth.errorConnection");
        notify.error(tRaw(key));
        if (key === "account.errorWrongPassword") {
          setFieldError("currentPassword", { message: key });
        } else {
          setError(key);
        }
        return;
      }
      setSuccess(true);
      notify.success(tRaw("toast.passwordChanged"));
      reset();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1200);
    } catch {
      setError("auth.errorConnection");
      notify.error(tRaw("auth.errorConnection"));
    } finally {
      setIsSubmitting(false);
    }
  });

  return { control, onSubmit, error, success, isSubmitting };
}
