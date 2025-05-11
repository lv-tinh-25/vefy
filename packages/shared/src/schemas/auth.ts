import { z } from "zod";

// ─── Registration ─────────────────────────────────────────────────
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "validation.emailRequired")
      .email("validation.emailInvalid"),
    password: z
      .string()
      .min(8, "validation.passwordMin")
      .max(72, "validation.passwordMax"),
    confirmPassword: z.string().min(1, "validation.confirmRequired"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "validation.passwordMismatch",
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Login ────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "validation.emailRequired")
    .email("validation.emailInvalid"),
  password: z.string().min(1, "validation.passwordRequired"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Complete Profile ─────────────────────────────────────────────
export const completeProfileSchema = z.object({
  name: z
    .string()
    .min(2, "validation.nameMin")
    .max(100, "validation.nameMax"),
  image: z
    .string()
    .refine(
      (val) =>
        val === "" ||
        val.startsWith("data:image/") ||
        /^https?:\/\//.test(val),
      { message: "validation.imageInvalid" },
    )
    .optional()
    .or(z.literal("")),
});

export type CompleteProfileInput = z.infer<typeof completeProfileSchema>;

// ─── Update Profile (from Account Settings) ──────────────────────
export const updateProfileSchema = completeProfileSchema;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ─── Change Password ─────────────────────────────────────────────
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "validation.passwordRequired"),
    newPassword: z
      .string()
      .min(8, "validation.passwordMin")
      .max(72, "validation.passwordMax"),
    confirmNewPassword: z.string().min(1, "validation.confirmRequired"),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "validation.passwordMismatch",
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
