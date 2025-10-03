export type VehicleColorKey =
  | "white" | "black" | "silver" | "gray" | "red" | "blue" | "green" | "brown" | "orange" | "yellow";

export interface VehicleColor {
  key: VehicleColorKey;
  /** Stored value in the database (kept in Vietnamese for existing rows); display via i18n `colors.<key>` */
  name: string;
  hex: string;
}

export const VEHICLE_COLORS: VehicleColor[] = [
  { key: "white", name: "Trắng", hex: "#FFFFFF" },
  { key: "black", name: "Đen", hex: "#1A1A1A" },
  { key: "silver", name: "Bạc", hex: "#C0C0C0" },
  { key: "gray", name: "Xám", hex: "#808080" },
  { key: "red", name: "Đỏ", hex: "#DC2626" },
  { key: "blue", name: "Xanh dương", hex: "#2563EB" },
  { key: "green", name: "Xanh lá", hex: "#16A34A" },
  { key: "brown", name: "Nâu", hex: "#92400E" },
  { key: "orange", name: "Cam", hex: "#EA580C" },
  { key: "yellow", name: "Vàng", hex: "#EAB308" },
];

export function getColorHex(name: string): string {
  return VEHICLE_COLORS.find((c) => c.name === name)?.hex ?? "#808080";
}
