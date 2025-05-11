"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterInput } from "@vefy/shared";
import { signUp, signIn } from "@/lib/auth-client";

export function useRegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        return;
      }
      router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch {
      setError("auth.errorConnection");
    } finally {
      setIsSubmitting(false);
    }
  });

  const signUpWithGoogle = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/garage`,
    });
  };

  return { control, onSubmit, signUpWithGoogle, error, isSubmitting };
}
