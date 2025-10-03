"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, type LoginInput } from "@vefy/shared";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { useT } from "@/lib/i18n";

export function useLoginForm() {
  const router = useRouter();
  const { t } = useT();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      });
      if (result.error) {
        if (result.error.code === "EMAIL_NOT_VERIFIED") {
          router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}&from=login`);
          return;
        }
        toast.error(t("auth.errorLogin"));
        return;
      }
      router.push("/garage");
    } catch {
      toast.error(t("auth.errorConnection"));
    } finally {
      setIsSubmitting(false);
    }
  });

  const signInWithGoogle = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/garage`,
    });
  };

  return { control, onSubmit, signInWithGoogle, isSubmitting };
}
