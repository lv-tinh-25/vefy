"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@vefy/shared";
import { signUp, signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export function useRegisterForm() {
  const router = useRouter();
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { control, handleSubmit } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: data.email.split("@")[0],
      });
      if (result.error) {
        setError(result.error.message ?? "auth.errorRegister");
        setIsSubmitting(false);
        return;
      }
      // Keep the form locked while navigating away
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
      return;
    } catch {
      setError("auth.errorConnection");
    }
    setIsSubmitting(false);
  });

  const signUpWithGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/garage`,
      });
      // On success the browser is already leaving for Google; only an error lands here
      if (result.error) {
        toast.error(t("auth.errorConnection"));
        setIsGoogleLoading(false);
      }
    } catch {
      toast.error(t("auth.errorConnection"));
      setIsGoogleLoading(false);
    }
  };

  return {
    control,
    onSubmit,
    signUpWithGoogle,
    error,
    isSubmitting,
    isGoogleLoading,
    isBusy: isSubmitting || isGoogleLoading,
  };
}
