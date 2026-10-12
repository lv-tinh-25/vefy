import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  dismissAlertSchema,
  dismissAllAlertsSchema,
  notificationSettingsSchema,
  pushEndpointSchema,
  pushSubscriptionSchema,
} from "@vefy/shared";
import { getVapidPublicKey } from "../lib/push";
import * as notificationService from "../services/notification.service";
import * as pushService from "../services/push.service";
import * as reminderService from "../services/reminder.service";
import * as vehicleService from "../services/vehicle.service";
import type { AuthEnv } from "../middleware/auth";

export const notificationRoutes = new Hono<AuthEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const [{ alerts, vehicleNames }, dismissedKeys] = await Promise.all([
      vehicleService.listAllAlerts(userId),
      notificationService.listDismissedKeys(userId),
    ]);
    return c.json({ alerts, vehicleNames, dismissedKeys });
  })
  .post("/dismiss", zValidator("json", dismissAlertSchema), async (c) => {
    const userId = c.get("userId");
    const { alertKey } = c.req.valid("json");
    await notificationService.dismissOne(userId, alertKey);
    return c.json({ success: true });
  })
  .post("/dismiss-all", zValidator("json", dismissAllAlertsSchema), async (c) => {
    const userId = c.get("userId");
    const { alertKeys } = c.req.valid("json");
    await notificationService.dismissMany(userId, alertKeys);
    return c.json({ success: true, count: alertKeys.length });
  })
  .get("/settings", async (c) => {
    const settings = await reminderService.getSettings(c.get("userId"));
    // A null key means push isn't configured on this deployment, so the UI hides it
    return c.json({ ...settings, vapidPublicKey: getVapidPublicKey() }, 200);
  })
  .patch("/settings", zValidator("json", notificationSettingsSchema), async (c) => {
    const { emailReminders } = c.req.valid("json");
    await reminderService.setEmailReminders(c.get("userId"), emailReminders);
    return c.json({ emailReminders }, 200);
  })
  .post("/push/subscribe", zValidator("json", pushSubscriptionSchema), async (c) => {
    await pushService.subscribe(c.get("userId"), c.req.valid("json"), c.req.header("user-agent") ?? null);
    return c.json({ success: true }, 200);
  })
  .post("/push/unsubscribe", zValidator("json", pushEndpointSchema), async (c) => {
    await pushService.unsubscribe(c.get("userId"), c.req.valid("json").endpoint);
    return c.json({ success: true }, 200);
  })
  .post("/push/test", zValidator("json", pushEndpointSchema), async (c) => {
    const sent = await pushService.sendToUser(
      c.get("userId"),
      { title: "Vefy", body: "Thông báo đã hoạt động trên thiết bị này.", url: "/account", tag: "vefy-test" },
      c.req.valid("json").endpoint,
    );
    if (sent === 0) return c.json({ error: "PUSH_FAILED" }, 502);
    return c.json({ success: true }, 200);
  });
