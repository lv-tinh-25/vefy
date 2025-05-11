import { z } from "zod";

export const insertOilChangeSchema = z.object({
  vehicleId: z.string().uuid(),
  date: z.string().min(1, "validation.dateRequired"),
  odometer: z.coerce
    .number({ invalid_type_error: "validation.odometerRequired" })
    .int("validation.odometerInt")
    .positive("validation.odometerPositive"),
  cost: z.coerce
    .number({ invalid_type_error: "validation.costMin" })
    .int("validation.costMin")
    .min(0, "validation.costMin"),
  oilType: z.string().optional(),
  note: z.string().optional(),
});

export type InsertOilChange = z.infer<typeof insertOilChangeSchema>;

export interface OilChange {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  cost: number;
  oilType: string | null;
  note: string | null;
  createdAt: string;
}
