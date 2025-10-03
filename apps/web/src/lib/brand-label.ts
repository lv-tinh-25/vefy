import { OTHER_BRAND } from "@vefy/shared";
import type { MessageKey } from "@/lib/i18n";

type Translate = (key: MessageKey) => string;

export function getBrandLabel(brand: string, t: Translate): string {
  return brand === OTHER_BRAND ? t("brands.other") : brand;
}
