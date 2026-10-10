import { z } from "zod";

export const vehicleTypeSchema = z.enum(["car", "motorcycle"]);
export type VehicleType = z.infer<typeof vehicleTypeSchema>;

export const motorcycleVariantSchema = z.enum(["manual", "scooter", "electric"]);
export type MotorcycleVariant = z.infer<typeof motorcycleVariantSchema>;

export const vehicleColorValues = [
  "Trắng",
  "Đen",
  "Bạc",
  "Xám",
  "Đỏ",
  "Xanh dương",
  "Xanh lá",
  "Nâu",
  "Cam",
  "Vàng",
] as const;

export const vehicleColorSchema = z.enum(vehicleColorValues);

const currentYear = new Date().getFullYear();

export const insertVehicleSchema = z.object({
  type: vehicleTypeSchema,
  variant: motorcycleVariantSchema.optional(),
  name: z.string().optional(),
  brand: z.string().min(1, "validation.brandRequired"),
  model: z.string().min(1, "validation.modelRequired"),
  year: z.coerce
    .number({ invalid_type_error: "validation.yearInvalid" })
    .int("validation.yearInvalid")
    .min(1900, "validation.yearInvalid")
    .max(currentYear + 1, "validation.yearInvalid"),
  licensePlate: z.string().min(1, "validation.licensePlateRequired"),
  color: vehicleColorSchema,
}).refine((v) => v.type === "car" || v.variant !== undefined, {
  message: "validation.variantRequired",
  path: ["variant"],
});

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export const updateVehicleInfoSchema = z.object({
  name: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.coerce
    .number({ invalid_type_error: "validation.yearInvalid" })
    .int("validation.yearInvalid")
    .min(1900, "validation.yearInvalid")
    .max(currentYear + 1, "validation.yearInvalid")
    .optional(),
  licensePlate: z.string().optional(),
  color: vehicleColorSchema.optional(),
  warrantyExpiry: z.string().nullable().optional(),
  registrationExpiry: z.string().nullable().optional(),
  insuranceExpiry: z.string().nullable().optional(),
  variant: motorcycleVariantSchema.optional(),
});

export type UpdateVehicleInfo = z.infer<typeof updateVehicleInfoSchema>;

export const vehicleImageSchema = z.object({
  image: z.string().startsWith("data:image/", "validation.imageInvalid"),
});

export interface Vehicle {
  id: string;
  userId: string;
  type: VehicleType;
  /** Always null for cars */
  variant: MotorcycleVariant | null;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  imageUrl: string | null;
  warrantyExpiry: string | null;
  registrationExpiry: string | null;
  insuranceExpiry: string | null;
  createdAt: string;
  updatedAt: string;
}
