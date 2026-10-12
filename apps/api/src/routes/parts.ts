import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { insertPartsSchema } from "@vefy/shared";
import * as partService from "../services/part.service";

export const partRoutes = new Hono()
  .get("/", async (c) => {
    const vehicleId = c.req.param("vehicleId");
    if (!vehicleId) return c.json({ error: "Vehicle ID required" }, 400);
    const parts = await partService.listByVehicle(vehicleId);
    return c.json(parts);
  })
  .post("/", zValidator("json", insertPartsSchema), async (c) => {
    const vehicleId = c.req.param("vehicleId");
    if (!vehicleId) return c.json({ error: "Vehicle ID required" }, 400);
    const created = await partService.create(vehicleId, c.req.valid("json"));
    return c.json(created, 201);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await partService.remove(id, c.req.param("vehicleId") ?? "");
    return c.json({ success: true });
  });
