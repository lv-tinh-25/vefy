import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { insertOilChangeSchema } from "@vefy/shared";
import * as oilChangeService from "../services/oil-change.service";

export const oilChangeRoutes = new Hono()
  .get("/", async (c) => {
    const vehicleId = c.req.param("vehicleId");
    if (!vehicleId) return c.json({ error: "Vehicle ID required" }, 400);
    const oilChanges = await oilChangeService.listByVehicle(vehicleId);
    return c.json(oilChanges);
  })
  .post(
    "/",
    zValidator(
      "json",
      insertOilChangeSchema.omit({ vehicleId: true }),
    ),
    async (c) => {
      const vehicleId = c.req.param("vehicleId");
      if (!vehicleId) return c.json({ error: "Vehicle ID required" }, 400);
      const data = c.req.valid("json");
      try {
        const oilChange = await oilChangeService.create({
          ...data,
          vehicleId,
        });
        return c.json(oilChange, 201);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Lỗi tạo lần thay nhớt";
        return c.json({ error: message }, 400);
      }
    },
  )
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await oilChangeService.remove(id, c.req.param("vehicleId") ?? "");
    return c.json({ success: true });
  });
