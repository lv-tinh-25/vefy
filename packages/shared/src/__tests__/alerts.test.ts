import { describe, expect, it } from "vitest";
import { computeDocumentAlerts } from "../utils/alerts";
import type { Vehicle } from "../schemas/vehicle";

const NOW = new Date("2026-10-03T03:00:00Z");

function vehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: "v1",
    userId: "u1",
    type: "car",
    name: "Test",
    brand: "Toyota",
    model: "Vios",
    year: 2026,
    licensePlate: "51A-123.45",
    color: "Trắng",
    warrantyExpiry: null,
    registrationExpiry: null,
    insuranceExpiry: null,
    oilCycleKm: 5000,
    oilUseDays: false,
    oilCycleDays: 180,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("computeDocumentAlerts", () => {
  it("includes registration only for cars", () => {
    expect(computeDocumentAlerts(vehicle(), NOW).map((a) => a.type)).toEqual([
      "warranty",
      "registration",
      "insurance",
    ]);
    expect(computeDocumentAlerts(vehicle({ type: "motorcycle" }), NOW).map((a) => a.type)).toEqual([
      "warranty",
      "insurance",
    ]);
  });

  it("maps days remaining to status", () => {
    const [warranty, , insurance] = computeDocumentAlerts(
      vehicle({ warrantyExpiry: "2026-10-20", insuranceExpiry: "2026-10-02" }),
      NOW,
    );
    expect(warranty).toMatchObject({ status: "warning", daysRemaining: 17 });
    expect(insurance).toMatchObject({ status: "danger", daysRemaining: -1 });
  });

  it("is neutral when no date is set", () => {
    expect(computeDocumentAlerts(vehicle(), NOW)[0]).toMatchObject({ status: "neutral", daysRemaining: null });
  });
});
