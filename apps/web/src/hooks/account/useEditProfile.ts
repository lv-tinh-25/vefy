"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfileSchema, type UpdateProfileInput } from "@vefy/shared";
import { api } from "@/lib/api";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";
import { useAuth } from "@/hooks/auth/useAuth";

export function useEditProfile(onClose: () => void) {
  const { profile, mutate } = useAuth();
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: profile
      ? { name: profile.name, image: profile.image ?? "" }
      : undefined,
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
          return;
        }
        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      // If image was cleared, delete from storage
      if (imageUrl === "" && profile?.image) {
        await api.api.upload.avatar.$delete();
      }

      // Update profile with the final URL
      const res = await api.api.profile.update.$patch({
        json: { name: data.name, image: imageUrl },
      });
      if (!res.ok) {
        setError("auth.errorConnection");
        notify.error(t("toast.saveFailed"));
        return;
      }
      await mutate();
      onClose();
      notify.success(t("toast.profileSaved"));
    } catch {
      setError("auth.errorConnection");
      notify.error(t("auth.errorConnection"));
    } finally {
      setIsSubmitting(false);
    }
  });

  return { control, onSubmit, error, isSubmitting };
}
