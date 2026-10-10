import type { MotorcycleVariant, VehicleType } from "@vefy/shared";
import type { MessageKey } from "@/lib/i18n";

type Translate = (key: MessageKey) => string;

/** Motorcycles show their category ("Tay ga"), which already implies the type */
export function getVehicleTypeLabel(
  vehicle: { type: VehicleType; variant: MotorcycleVariant | null },
  t: Translate,
): string {
  if (vehicle.type === "car") return t("common.car");
  return vehicle.variant ? t(`vehicleVariant.${vehicle.variant}`) : t("common.motorcycle");
}
