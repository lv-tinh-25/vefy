import { z } from "zod";

export const dismissAlertSchema = z.object({
  alertKey: z.string().min(1).max(200),
});

export const dismissAllAlertsSchema = z.object({
  alertKeys: z.array(z.string().min(1).max(200)).min(1).max(500),
});

export type DismissAlert = z.infer<typeof dismissAlertSchema>;
export type DismissAllAlerts = z.infer<typeof dismissAllAlertsSchema>;

// Every browser push service is HTTPS; rejecting anything else keeps the server from posting to arbitrary URLs
const pushEndpoint = z
  .string()
  .url()
  .max(1000)
  .refine((url) => url.startsWith("https://"), "Push endpoint must use HTTPS");

// Shape of PushSubscription.toJSON() in the browser
export const pushSubscriptionSchema = z.object({
  endpoint: pushEndpoint,
  keys: z.object({
    p256dh: z.string().min(1).max(200),
    auth: z.string().min(1).max(100),
  }),
});

export const pushEndpointSchema = z.object({
  endpoint: pushEndpoint,
});

export const notificationSettingsSchema = z.object({
  emailReminders: z.boolean(),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
export type NotificationSettings = z.infer<typeof notificationSettingsSchema>;
