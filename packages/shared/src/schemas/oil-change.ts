import { z } from "zod";
import { OIL_KINDS, type OilKind } from "../constants/oil";
import { emptyAsUndefined } from "./number";

export const oilKindSchema = z.enum(OIL_KINDS);

export const oilChangeItemSchema = z.object({
  kind: oilKindSchema,
  cost: emptyAsUndefined(
    z.coerce
      .number({ invalid_type_error: "validation.costRequired" })
      .int("validation.costMin")
      .min(0, "validation.costMin"),
  ),
  oilType: z.string().optional(),
  note: z.string().optional(),
});

export const insertOilChangesSchema = z.object({
  date: z.string().min(1, "validation.dateRequired"),
  odometer: emptyAsUndefined(
    z.coerce
      .number({ invalid_type_error: "validation.odometerRequired" })
      .int("validation.odometerInt")
      .positive("validation.odometerPositive"),
  ),
  items: z
    .array(oilChangeItemSchema)
    .min(1)
    .refine((items) => new Set(items.map((i) => i.kind)).size === items.length, {
      message: "validation.oilKindDuplicate",
    }),
});

export type InsertOilChanges = z.infer<typeof insertOilChangesSchema>;
export type OilChangeItem = z.infer<typeof oilChangeItemSchema>;

export const oilSettingSchema = z.object({
  kind: oilKindSchema,
  enabled: z.boolean(),
  cycleKm: emptyAsUndefined(
    z.coerce
      .number({ invalid_type_error: "validation.oilCycleKmPositive" })
      .int("validation.oilCycleKmPositive")
      .positive("validation.oilCycleKmPositive"),
  ),
  useDays: z.boolean(),
  cycleDays: emptyAsUndefined(
    z.coerce
      .number({ invalid_type_error: "validation.oilCycleDaysPositive" })
      .int("validation.oilCycleDaysPositive")
      .positive("validation.oilCycleDaysPositive"),
  ),
});

export const updateOilSettingsSchema = z.object({
  settings: z.array(oilSettingSchema).min(1),
});

export type UpdateOilSettings = z.infer<typeof updateOilSettingsSchema>;

export interface OilChange {
  id: string;
  vehicleId: string;
  kind: OilKind;
  date: string;
  odometer: number;
  cost: number;
  oilType: string | null;
  note: string | null;
  createdAt: string;
}
