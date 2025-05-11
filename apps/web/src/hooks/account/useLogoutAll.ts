"use client";

import { useState } from "react";
import { revokeOtherSessions } from "@/lib/auth-client";

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
        setError(result.error.message ?? "auth.errorConnection");
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
