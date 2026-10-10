import { describe, expect, it } from "vitest";
import { insertPartSchema } from "../schemas/part";
import { insertOilChangesSchema } from "../schemas/oil-change";
import { insertVehicleSchema } from "../schemas/vehicle";

const part = { vehicleId: "00000000-0000-0000-0000-000000000000", name: "Lọc gió", installDate: "2026-10-01", cost: 100000 };

function firstError(result: { success: boolean; error?: { issues: { message: string }[] } }) {
  return result.error?.issues[0]?.message;
}

describe("cleared number inputs", () => {
  it("rejects a cleared required field instead of coercing it to 0", () => {
    expect(firstError(insertPartSchema.safeParse({ ...part, warrantyMonths: null }))).toBe("validation.warrantyMonthsRequired");
    expect(firstError(insertPartSchema.safeParse({ ...part, warrantyMonths: 6, cost: null }))).toBe("validation.costRequired");
  });

  it("leaves a cleared optional field unset", () => {
    const parsed = insertPartSchema.parse({ ...part, warrantyMonths: 6, odometer: null });
    expect(parsed.odometer).toBeUndefined();
    expect(parsed.warrantyMonths).toBe(6);
  });

  it("still accepts 0", () => {
    expect(insertPartSchema.parse({ ...part, warrantyMonths: 0 }).warrantyMonths).toBe(0);
  });
});

describe("insertOilChangesSchema", () => {
  const visit = { date: "2026-10-10", odometer: 12000, items: [{ kind: "engine", cost: 120000 }] };

  it("accepts several kinds in one visit", () => {
    const items = [...visit.items, { kind: "gear", cost: 40000, oilType: "Motul" }];
    expect(insertOilChangesSchema.parse({ ...visit, items }).items).toHaveLength(2);
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
