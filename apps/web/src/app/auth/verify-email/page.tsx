"use client";

import { Suspense } from "react";
import { VerifyEmail } from "@/components/core/templates/Auth/VerifyEmail";

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmail />
    </Suspense>
  );
}
