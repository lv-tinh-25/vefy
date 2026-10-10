"use client";

import { useState } from "react";
import { deleteUser } from "@/lib/auth-client";
import { getAuthErrorKey } from "@/lib/auth-errors";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";

export function useDeleteAccount(expectedEmail: string) {
  const { tRaw } = useT();
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
        notify.afterReload("success", tRaw("toast.accountDeleted"));
        // Full reload drops the SWR cache of the deleted account; the dialog stays locked until then
        window.location.replace("/auth/login");
        return;
      }
      const key = getAuthErrorKey(result.error, "auth.errorConnection");
      setError(key);
      notify.error(tRaw(key));
    } catch {
      setError("auth.errorConnection");
      notify.error(tRaw("auth.errorConnection"));
    }
    setIsSubmitting(false);
  };

  return { emailInput, setEmailInput, isMatch, error, isSubmitting, onConfirm };
}
