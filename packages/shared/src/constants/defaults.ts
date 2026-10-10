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

export const OCR_LIMITS = {
  dailyPerUser: 10,
  cooldownSeconds: 10,
} as const;
