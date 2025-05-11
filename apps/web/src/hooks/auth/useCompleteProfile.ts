"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { completeProfileSchema, type CompleteProfileInput } from "@vefy/shared";
import { api } from "@/lib/api";

export function useCompleteProfile() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          return;
        }
        const { url } = await uploadRes.json();
        imageUrl = url;
      }

      const res = await api.api.profile.complete.$patch({
        json: { name: data.name, image: imageUrl },
      });
      if (!res.ok) {
        setError("auth.errorConnection");
        return;
      }
      router.push("/garage");
    } catch {
      setError("auth.errorConnection");
    } finally {
      setIsSubmitting(false);
    }
  });

  return { control, onSubmit, error, isSubmitting };
}
