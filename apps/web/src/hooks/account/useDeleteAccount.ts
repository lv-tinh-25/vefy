"use client";

import { useState } from "react";
import { deleteUser } from "@/lib/auth-client";
import { getAuthErrorKey } from "@/lib/auth-errors";

export function useDeleteAccount(expectedEmail: string) {
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
      if (!result.error) {
        // Full reload drops the SWR cache of the deleted account; the dialog stays locked until then
        window.location.replace("/auth/login");
        return;
      }
      setError(getAuthErrorKey(result.error, "auth.errorConnection"));
    } catch {
      setError("auth.errorConnection");
    }
    setIsSubmitting(false);
  };

  return { emailInput, setEmailInput, isMatch, error, isSubmitting, onConfirm };
}
