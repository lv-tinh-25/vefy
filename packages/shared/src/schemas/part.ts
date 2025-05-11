import { z } from "zod";

export const insertPartSchema = z.object({
  vehicleId: z.string().uuid(),
  name: z.string().min(1, "validation.partNameRequired"),
  installDate: z.string().min(1, "validation.dateRequired"),
  warrantyMonths: z.coerce
    .number({ invalid_type_error: "validation.warrantyMonthsInvalid" })
    .int("validation.warrantyMonthsInvalid")
    .min(0, "validation.warrantyMonthsMin")
    .default(12),
  odometer: z.coerce
    .number({ invalid_type_error: "validation.odometerRequired" })
    .int("validation.odometerInt")
    .min(0, "validation.odometerMin")
    .optional(),
  cost: z.coerce
    .number({ invalid_type_error: "validation.costMin" })
    .int("validation.costMin")
    .min(0, "validation.costMin"),
  note: z.string().optional(),
});

export type InsertPart = z.infer<typeof insertPartSchema>;

export interface Part {
  id: string;
  vehicleId: string;
  name: string;
  installDate: string;
  warrantyMonths: number;
  warrantyExpiry: string;
  odometer: number | null;
  cost: number;
  note: string | null;
  createdAt: string;
}
