"use client";

import { useState } from "react";
import { revokeOtherSessions } from "@/lib/auth-client";
import { getAuthErrorKey } from "@/lib/auth-errors";

export function useLogoutAll() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoutAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await revokeOtherSessions();
      if (result.error) {
        setError(getAuthErrorKey(result.error, "auth.errorConnection"));
        return;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch {
      setError("auth.errorConnection");
    } finally {
      setLoading(false);
    }
  };

  return { logoutAll, loading, success, error };
}
