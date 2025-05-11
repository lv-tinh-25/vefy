import { z } from "zod";

export const expenseCategorySchema = z.enum(["part", "other"]);
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;

export const insertExpenseSchema = z.object({
  vehicleId: z.string().uuid(),
  oilChangeId: z.string().uuid().nullable().optional(),
  partId: z.string().uuid().nullable().optional(),
  date: z.string().min(1, "validation.dateRequired"),
  amount: z.coerce
    .number({ invalid_type_error: "validation.costMin" })
    .int("validation.costMin")
    .min(0, "validation.costMin"),
  category: expenseCategorySchema,
  name: z.string().min(1, "validation.expenseNameRequired"),
  note: z.string().optional(),
});
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

export const createOtherExpenseSchema = z.object({
  date: z.string().min(1, "validation.dateRequired"),
  amount: z.coerce
    .number({ invalid_type_error: "validation.costMin" })
    .int("validation.costMin")
    .min(0, "validation.costMin"),
  name: z.string().min(1, "validation.expenseNameRequired"),
  note: z.string().optional(),
});
export type CreateOtherExpense = z.infer<typeof createOtherExpenseSchema>;

export interface Expense {
  id: string;
  vehicleId: string;
  oilChangeId: string | null;
  partId: string | null;
  date: string;
  amount: number;
  category: ExpenseCategory;
  name: string;
  note: string | null;
  createdAt: string;
}

export interface ExpenseSummary {
  period: string;
  part: number;
  other: number;
  total: number;
}
