"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/lib/auth-client";

export function useDeleteAccount(expectedEmail: string, onClose: () => void) {
  const router = useRouter();
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMatch = emailInput.trim().toLowerCase() === expectedEmail.toLowerCase();

  const onConfirm = async () => {
    if (!isMatch) {
      setError("account.deleteConfirmEmailMismatch");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await deleteUser();
      if (result.error) {
        setError(result.error.message ?? "auth.errorConnection");
        return;
      }
      onClose();
      router.push("/auth/login");
    } catch {
      setError("auth.errorConnection");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { emailInput, setEmailInput, isMatch, error, isSubmitting, onConfirm };
}
