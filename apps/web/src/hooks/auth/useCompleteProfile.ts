"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { completeProfileSchema, type CompleteProfileInput } from "@vefy/shared";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";
import { useAuth } from "@/hooks/auth/useAuth";

export function useCompleteProfile() {
  const router = useRouter();
  const { isProfileCompleted, isProfileLoading } = useAuth();
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification links stay valid after use, so re-clicking one lands here again
  useEffect(() => {
    if (isProfileCompleted) router.replace("/garage");
  }, [isProfileCompleted, router]);

  const { control, handleSubmit } = useForm<CompleteProfileInput>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { name: "", image: "" },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    setIsSubmitting(true);
    try {
      let imageUrl = data.image ?? "";

      // If image is a new base64 upload, upload to Supabase Storage first
      if (imageUrl.startsWith("data:image/")) {
        const uploadRes = await api.api.upload.avatar.$post({
          json: { image: imageUrl },
        });
        if (!uploadRes.ok) {
          setError("auth.errorConnection");
          notify.error(t("toast.saveFailed"));
          setIsSubmitting(false);
          return;
        }
        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      const res = await api.api.profile.complete.$patch({
        json: { name: data.name, image: imageUrl },
      });
      if (res.ok) {
        notify.success(t("toast.profileCompleted"));
        // Keep the form locked while navigating away
        router.push("/garage");
        return;
      }
      setError("auth.errorConnection");
      notify.error(t("toast.saveFailed"));
    } catch {
      setError("auth.errorConnection");
      notify.error(t("auth.errorConnection"));
    }
    setIsSubmitting(false);
  });

  return {
    control,
    onSubmit,
    error,
    isSubmitting,
    isChecking: isProfileLoading || isProfileCompleted,
  };
}
