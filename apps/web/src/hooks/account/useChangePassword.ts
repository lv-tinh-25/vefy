"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@vefy/shared";
import { changePassword } from "@/lib/auth-client";

export function useChangePassword(onClose: () => void) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset } = useForm<ChangePasswordInput>({
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
        setError(result.error.message ?? "auth.errorConnection");
        return;
      }
      setSuccess(true);
      reset();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1200);
    } catch {
      setError("auth.errorConnection");
    } finally {
      setIsSubmitting(false);
    }
  });

  return { control, onSubmit, error, success, isSubmitting };
}
