import { z } from "zod";
import { emptyAsUndefined } from "./number";

export const partItemSchema = z
  .object({
    name: z.string().min(1, "validation.partNameRequired"),
    cost: emptyAsUndefined(
      z.coerce
        .number({ invalid_type_error: "validation.costRequired" })
        .int("validation.costMin")
        .min(0, "validation.costMin"),
    ),
    noWarranty: z.boolean(),
    // Ignored when noWarranty is set
    warrantyMonths: emptyAsUndefined(
      z.coerce
        .number({ invalid_type_error: "validation.warrantyMonthsRequired" })
        .int("validation.warrantyMonthsInvalid")
        .min(1, "validation.warrantyMonthsMin")
        .optional(),
    ),
    note: z.string().optional(),
  })
  .superRefine((item, ctx) => {
    if (!item.noWarranty && item.warrantyMonths === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "validation.warrantyMonthsRequired",
        path: ["warrantyMonths"],
      });
    }
  });

/** Several parts installed on the same day; each becomes its own part and expense */
export const insertPartsSchema = z.object({
  installDate: z.string().min(1, "validation.dateRequired"),
  odometer: emptyAsUndefined(
    z.coerce
      .number({ invalid_type_error: "validation.odometerRequired" })
      .int("validation.odometerInt")
      .min(0, "validation.odometerMin")
      .optional(),
  ),
  items: z.array(partItemSchema).min(1),
});

export type InsertParts = z.infer<typeof insertPartsSchema>;
export type PartItem = z.infer<typeof partItemSchema>;

export interface Part {
  id: string;
  vehicleId: string;
  name: string;
  installDate: string;
  /** Both null when the part has no warranty */
  warrantyMonths: number | null;
  warrantyExpiry: string | null;
  odometer: number | null;
  cost: number;
  note: string | null;
  createdAt: string;
}
