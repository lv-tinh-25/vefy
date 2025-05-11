import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { dismissAlertSchema, dismissAllAlertsSchema } from "@vefy/shared";
import * as notificationService from "../services/notification.service";
import * as vehicleService from "../services/vehicle.service";
import type { AuthEnv } from "../middleware/auth";

export const notificationRoutes = new Hono<AuthEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const [alerts, dismissedKeys] = await Promise.all([
      vehicleService.listAllAlerts(userId),
      notificationService.listDismissedKeys(userId),
    ]);
    return c.json({ alerts, dismissedKeys });
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
  });
