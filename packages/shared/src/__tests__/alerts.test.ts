import { describe, expect, it } from "vitest";
import { computeDocumentAlerts, computePartAlerts } from "../utils/alerts";
import type { Vehicle } from "../schemas/vehicle";

const NOW = new Date("2026-10-03T03:00:00Z");

function vehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    id: "v1",
    userId: "u1",
    type: "car",
    variant: null,
    name: "Test",
    brand: "Toyota",
    model: "Vios",
    year: 2026,
    licensePlate: "51A-123.45",
    color: "Trắng",
    imageUrl: null,
    warrantyExpiry: null,
    registrationExpiry: null,
    insuranceExpiry: null,
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

describe("computePartAlerts", () => {
  const base = { vehicleId: "v1", installDate: "2026-01-01", odometer: null, cost: 0, note: null, createdAt: "2026-01-01" };

  it("skips parts without a warranty", () => {
    const alerts = computePartAlerts(
      [
        { ...base, id: "p1", name: "Lọc gió", warrantyMonths: 12, warrantyExpiry: "2026-10-20" },
        { ...base, id: "p2", name: "Bugi", warrantyMonths: null, warrantyExpiry: null },
      ],
      NOW,
      "v1",
    );
    expect(alerts.map((a) => [a.subject, a.status])).toEqual([["Lọc gió", "warning"]]);
  });
});
