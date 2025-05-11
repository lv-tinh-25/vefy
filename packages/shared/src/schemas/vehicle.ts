import { z } from "zod";

export const vehicleTypeSchema = z.enum(["car", "motorcycle"]);
export type VehicleType = z.infer<typeof vehicleTypeSchema>;

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
  oilCycleKm: z.number().int().positive("validation.oilCycleKmPositive").optional(),
  oilUseDays: z.boolean().optional(),
  oilCycleDays: z.number().int().positive("validation.oilCycleDaysPositive").optional(),
});

export type UpdateVehicleInfo = z.infer<typeof updateVehicleInfoSchema>;

export interface Vehicle {
  id: string;
  userId: string;
  type: VehicleType;
  name: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  warrantyExpiry: string | null;
  registrationExpiry: string | null;
  insuranceExpiry: string | null;
  oilCycleKm: number;
  oilUseDays: boolean;
  oilCycleDays: number;
  createdAt: string;
  updatedAt: string;
}
