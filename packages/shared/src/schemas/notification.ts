import { z } from "zod";

export const dismissAlertSchema = z.object({
  alertKey: z.string().min(1).max(200),
});

export const dismissAllAlertsSchema = z.object({
  alertKeys: z.array(z.string().min(1).max(200)).min(1).max(500),
});

export type DismissAlert = z.infer<typeof dismissAlertSchema>;
export type DismissAllAlerts = z.infer<typeof dismissAllAlertsSchema>;
