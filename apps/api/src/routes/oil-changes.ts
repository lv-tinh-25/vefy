import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertOilChangesSchema, updateOilSettingsSchema } from "@vefy/shared";
import * as oilChangeService from "../services/oil-change.service";

export const oilChangeRoutes = new Hono()
  .get("/", async (c) => {
    const vehicleId = c.req.param("vehicleId");
    if (!vehicleId) return c.json({ error: "Vehicle ID required" }, 400);
    const oilChanges = await oilChangeService.listByVehicle(vehicleId);
    return c.json(oilChanges);
  })
  .post("/", zValidator("json", insertOilChangesSchema), async (c) => {
    const vehicleId = c.req.param("vehicleId");
    if (!vehicleId) return c.json({ error: "Vehicle ID required" }, 400);
    const data = c.req.valid("json");
    try {
      const oilChanges = await oilChangeService.create(vehicleId, data);
      return c.json(oilChanges, 201);
    } catch (err) {
      if (err instanceof oilChangeService.OdometerTooLowError) {
        return c.json({ code: "ODOMETER_TOO_LOW" as const, minOdometer: err.minOdometer }, 400);
      }
      if (err instanceof oilChangeService.OilKindUnavailableError) {
        return c.json({ code: "OIL_KIND_UNAVAILABLE" as const }, 400);
      }
      throw err;
    }
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await oilChangeService.remove(id, c.req.param("vehicleId") ?? "");
    return c.json({ success: true });
  });

export const oilSettingsRoutes = new Hono().put(
  "/",
  zValidator("json", updateOilSettingsSchema),
  async (c) => {
    const vehicleId = c.req.param("vehicleId");
    if (!vehicleId) return c.json({ error: "Vehicle ID required" }, 400);
    try {
      await oilChangeService.saveSettings(vehicleId, c.req.valid("json").settings);
      return c.json({ success: true }, 200);
    } catch (err) {
      if (err instanceof oilChangeService.OilKindUnavailableError) {
        return c.json({ code: "OIL_KIND_UNAVAILABLE" as const }, 400);
      }
      throw err;
    }
  },
);
