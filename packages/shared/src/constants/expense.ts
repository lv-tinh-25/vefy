import type { ExpenseCategory } from "../schemas/expense";

export interface ExpenseCategoryOption {
  value: ExpenseCategory;
  labelKey: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategoryOption[] = [
  { value: "part", labelKey: "category.part" },
  { value: "other", labelKey: "category.other" },
];
