import { z } from "zod";
import { emptyAsUndefined } from "./number";

export const insertPartSchema = z.object({
  vehicleId: z.string().uuid(),
  name: z.string().min(1, "validation.partNameRequired"),
  installDate: z.string().min(1, "validation.dateRequired"),
  warrantyMonths: emptyAsUndefined(
    z.coerce
      .number({ invalid_type_error: "validation.warrantyMonthsRequired" })
      .int("validation.warrantyMonthsInvalid")
      .min(0, "validation.warrantyMonthsMin"),
  ),
  odometer: emptyAsUndefined(
    z.coerce
      .number({ invalid_type_error: "validation.odometerRequired" })
      .int("validation.odometerInt")
      .min(0, "validation.odometerMin")
      .optional(),
  ),
  cost: emptyAsUndefined(
    z.coerce
      .number({ invalid_type_error: "validation.costRequired" })
      .int("validation.costMin")
      .min(0, "validation.costMin"),
  ),
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
