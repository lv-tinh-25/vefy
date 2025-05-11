export interface BrandGroup {
  labelKey: string;
  brands: string[];
}

export const CAR_BRAND_GROUPS: BrandGroup[] = [
  {
    labelKey: "brands.popular",
    brands: [
      "VinFast", "Toyota", "Hyundai", "Kia", "Honda",
      "Ford", "Mazda", "Mitsubishi", "Suzuki", "Nissan", "Isuzu",
    ],
  },
  {
    labelKey: "brands.chinese",
    brands: ["BYD", "Dongfeng", "Geely", "Wuling", "MG", "Haval", "Chery"],
  },
  {
    labelKey: "brands.luxury",
    brands: [
      "Mercedes-Benz", "BMW", "Audi", "Lexus",
      "Porsche", "Volvo", "Land Rover",
    ],
  },
  {
    labelKey: "brands.other",
    brands: ["Subaru", "Peugeot", "Chevrolet", "Khác"],
  },
];

export const MOTORCYCLE_BRAND_GROUPS: BrandGroup[] = [
  {
    labelKey: "brands.popularGas",
    brands: ["Honda", "Yamaha", "Suzuki", "Piaggio", "SYM"],
  },
  {
    labelKey: "brands.electric",
    brands: ["VinFast", "Yadea", "Dat Bike", "Pega"],
  },
  {
    labelKey: "brands.bigBike",
    brands: [
      "Kawasaki", "Ducati", "BMW Motorrad", "Harley-Davidson",
      "KTM", "Triumph", "Royal Enfield", "Aprilia",
    ],
  },
  {
    labelKey: "brands.other",
    brands: ["TVS Motor", "Khác"],
  },
];

export function getBrandGroups(type: "car" | "motorcycle"): BrandGroup[] {
  return type === "car" ? CAR_BRAND_GROUPS : MOTORCYCLE_BRAND_GROUPS;
}

export function getAllBrands(type: "car" | "motorcycle"): string[] {
  return getBrandGroups(type).flatMap((g) => g.brands);
}
