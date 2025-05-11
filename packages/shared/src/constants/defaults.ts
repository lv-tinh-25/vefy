export const OIL_CYCLE_DEFAULTS = {
  car: { km: 5000, days: 180 },
  motorcycle: { km: 1500, days: 90 },
} as const;

export const ALERT_THRESHOLDS = {
  document: {
    warningDays: 30,
    dangerDays: 0,
  },
  oil: {
    warningDays: 14,
    dangerDays: 0,
  },
  partWarranty: {
    warningDays: 30,
    dangerDays: 0,
  },
} as const;

export const DEFAULT_WARRANTY_MONTHS = 12;
