export interface VehicleColor {
  name: string;
  hex: string;
}

export const VEHICLE_COLORS: VehicleColor[] = [
  { name: "Trắng", hex: "#FFFFFF" },
  { name: "Đen", hex: "#1A1A1A" },
  { name: "Bạc", hex: "#C0C0C0" },
  { name: "Xám", hex: "#808080" },
  { name: "Đỏ", hex: "#DC2626" },
  { name: "Xanh dương", hex: "#2563EB" },
  { name: "Xanh lá", hex: "#16A34A" },
  { name: "Nâu", hex: "#92400E" },
  { name: "Cam", hex: "#EA580C" },
  { name: "Vàng", hex: "#EAB308" },
];

export function getColorHex(name: string): string {
  return VEHICLE_COLORS.find((c) => c.name === name)?.hex ?? "#808080";
}
