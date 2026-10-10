"use client";

import { useState } from "react";
import { revokeOtherSessions } from "@/lib/auth-client";
import { getAuthErrorKey } from "@/lib/auth-errors";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";

export function useLogoutAll() {
  const { tRaw } = useT();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoutAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await revokeOtherSessions();
      if (result.error) {
        const key = getAuthErrorKey(result.error, "auth.errorConnection");
        setError(key);
        notify.error(tRaw(key));
        return;
      }
      setSuccess(true);
      notify.success(tRaw("toast.otherSessionsRevoked"));
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError("auth.errorConnection");
      notify.error(tRaw("auth.errorConnection"));
    } finally {
      setLoading(false);
    }
  };

  return { logoutAll, loading, success, error };
}
