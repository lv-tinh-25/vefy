import { describe, expect, it } from "vitest";
import { insertPartsSchema, partItemSchema } from "../schemas/part";
import { insertOilChangesSchema } from "../schemas/oil-change";
import { insertVehicleSchema } from "../schemas/vehicle";
import { createOtherExpensesSchema } from "../schemas/expense";

const part = { name: "Lọc gió", cost: 100000, noWarranty: false };

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0]?.message;
}

describe("cleared number inputs", () => {
  it("rejects a cleared required field instead of coercing it to 0", () => {
    expect(firstError(partItemSchema.safeParse({ ...part, warrantyMonths: null }))).toBe("validation.warrantyMonthsRequired");
    expect(firstError(partItemSchema.safeParse({ ...part, warrantyMonths: 6, cost: null }))).toBe("validation.costRequired");
  });

  it("leaves a cleared optional field unset", () => {
    const parsed = insertPartsSchema.parse({ installDate: "2026-10-01", odometer: null, items: [{ ...part, warrantyMonths: 6 }] });
    expect(parsed.odometer).toBeUndefined();
    expect(parsed.items[0].warrantyMonths).toBe(6);
  });
});

describe("partItemSchema warranty", () => {
  it("needs at least one month unless the part has no warranty", () => {
    expect(firstError(partItemSchema.safeParse({ ...part, warrantyMonths: 0 }))).toBe("validation.warrantyMonthsMin");
    expect(partItemSchema.safeParse({ ...part, noWarranty: true, warrantyMonths: null }).success).toBe(true);
    // A leftover value is ignored once the part is marked as unwarranted
    expect(partItemSchema.safeParse({ ...part, noWarranty: true, warrantyMonths: 12 }).success).toBe(true);
  });
});

describe("insertPartsSchema", () => {
  it("takes several parts with their own notes and rejects an empty list", () => {
    const items = [
      { ...part, warrantyMonths: 12, note: "Hãng" },
      { name: "Bugi", cost: 50000, noWarranty: true, note: "" },
    ];
    expect(insertPartsSchema.parse({ installDate: "2026-10-01", items }).items).toHaveLength(2);
    expect(insertPartsSchema.safeParse({ installDate: "2026-10-01", items: [] }).success).toBe(false);
  });
});

describe("createOtherExpensesSchema", () => {
  it("takes several expenses on one date", () => {
    const items = [{ name: "Xăng", amount: 80000 }, { name: "Rửa xe", amount: 30000, note: "Tiệm B" }];
    expect(createOtherExpensesSchema.parse({ date: "2026-10-12", items }).items).toHaveLength(2);
    expect(firstError(createOtherExpensesSchema.safeParse({ date: "2026-10-12", items: [{ name: "", amount: 1 }] }))).toBe(
      "validation.expenseNameRequired",
    );
  });
});

describe("insertOilChangesSchema", () => {
  const visit = { date: "2026-10-10", odometer: 12000, items: [{ kind: "engine", cost: 120000 }] };

  it("accepts several kinds in one visit, each with its own note", () => {
    const items = [...visit.items, { kind: "gear", cost: 40000, oilType: "Motul", note: "Tiệm A" }];
    expect(insertOilChangesSchema.parse({ ...visit, items }).items[1].note).toBe("Tiệm A");
  });

  it("rejects the same kind twice and an empty list", () => {
    expect(firstError(insertOilChangesSchema.safeParse({ ...visit, items: [...visit.items, ...visit.items] }))).toBe(
      "validation.oilKindDuplicate",
    );
    expect(insertOilChangesSchema.safeParse({ ...visit, items: [] }).success).toBe(false);
  });
});

describe("insertVehicleSchema", () => {
  const vehicle = { brand: "Honda", model: "Vision", year: 2022, licensePlate: "43A-1", color: "Đen" };

  it("requires a variant for motorcycles only", () => {
    expect(firstError(insertVehicleSchema.safeParse({ ...vehicle, type: "motorcycle" }))).toBe("validation.variantRequired");
    expect(insertVehicleSchema.safeParse({ ...vehicle, type: "motorcycle", variant: "scooter" }).success).toBe(true);
    expect(insertVehicleSchema.safeParse({ ...vehicle, type: "car" }).success).toBe(true);
  });
});
