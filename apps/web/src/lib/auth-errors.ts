import type { MessageKey } from "@/lib/i18n/types";

interface AuthClientError {
  code?: string;
  status: number;
}

// better-auth error messages are English-only; map known codes to i18n keys
export function getAuthErrorKey(error: AuthClientError, fallback: MessageKey): MessageKey {
  if (error.status === 429) return "auth.errorTooManyRequests";
  if (error.code === "INVALID_PASSWORD") return "account.errorWrongPassword";
  if (error.code === "SESSION_EXPIRED") return "account.errorSessionExpired";
  return fallback;
}
