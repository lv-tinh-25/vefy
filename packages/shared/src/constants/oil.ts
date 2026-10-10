import type { MotorcycleVariant, VehicleType } from "../schemas/vehicle";

export const OIL_KINDS = [
  "engine",
  "transmission",
  "brake",
  "power_steering",
  "differential",
  "gear",
] as const;

export type OilKind = (typeof OIL_KINDS)[number];

export interface OilSetting {
  kind: OilKind;
  enabled: boolean;
  cycleKm: number;
  useDays: boolean;
  cycleDays: number;
}

export type OilProfile = "car" | "manual" | "scooter";

export const OIL_KIND_DEFAULTS: Record<OilProfile, OilSetting[]> = {
  car: [
    { kind: "engine", enabled: true, cycleKm: 5000, useDays: false, cycleDays: 180 },
    { kind: "transmission", enabled: true, cycleKm: 60000, useDays: false, cycleDays: 730 },
    { kind: "brake", enabled: true, cycleKm: 40000, useDays: true, cycleDays: 730 },
    { kind: "power_steering", enabled: false, cycleKm: 60000, useDays: false, cycleDays: 730 },
    { kind: "differential", enabled: false, cycleKm: 40000, useDays: false, cycleDays: 730 },
  ],
  manual: [
    { kind: "engine", enabled: true, cycleKm: 2000, useDays: false, cycleDays: 90 },
  ],
  scooter: [
    { kind: "engine", enabled: true, cycleKm: 2000, useDays: false, cycleDays: 90 },
    { kind: "gear", enabled: true, cycleKm: 6000, useDays: false, cycleDays: 180 },
  ],
};

/** Electric motorcycles have no oil to change. A motorcycle without a variant predates variants and counts as manual. */
export function getOilProfile(
  type: VehicleType,
  variant: MotorcycleVariant | null,
): OilProfile | null {
  if (type === "car") return "car";
  if (variant === "electric") return null;
  return variant ?? "manual";
}

/** Applicable kinds in display order, with stored overrides applied over the defaults. */
export function resolveOilSettings(
  type: VehicleType,
  variant: MotorcycleVariant | null,
  stored: OilSetting[],
): OilSetting[] {
  const profile = getOilProfile(type, variant);
  if (!profile) return [];
  return OIL_KIND_DEFAULTS[profile].map((def) => {
    const s = stored.find((row) => row.kind === def.kind);
    return s
      ? { kind: s.kind, enabled: s.enabled, cycleKm: s.cycleKm, useDays: s.useDays, cycleDays: s.cycleDays }
      : def;
  });
}
