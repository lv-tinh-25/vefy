import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { zValidator } from "@hono/zod-validator";
import { insertVehicleSchema, updateVehicleInfoSchema } from "@vefy/shared";
import * as vehicleService from "../services/vehicle.service";
import { oilChangeRoutes } from "./oil-changes";
import { partRoutes } from "./parts";
import { expenseRoutes } from "./expenses";
import type { AuthEnv } from "../middleware/auth";

// Hono exposes the param under the name used by the matched route: "id" on /:id, "vehicleId" on
// the mounted sub-routers — the wildcard must use :vehicleId or it never matches them
const requireVehicleOwner = createMiddleware<AuthEnv>(async (c, next) => {
  const vehicleId = c.req.param("vehicleId") ?? c.req.param("id") ?? "";
  const owned = await vehicleService.isOwnedBy(vehicleId, c.get("userId"));
  if (!owned) return c.json({ error: "Vehicle not found" }, 404);
  await next();
});

export const vehicleRoutes = new Hono<AuthEnv>()
  .use("/:id", requireVehicleOwner)
  .use("/:vehicleId/*", requireVehicleOwner)
  .get("/", async (c) => {
    const userId = c.get("userId");
    const vehicles = await vehicleService.listAll(userId);
    return c.json(vehicles);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const vehicle = await vehicleService.getById(id);
    if (!vehicle) return c.json({ error: "Vehicle not found" }, 404);
    return c.json(vehicle);
  })
  .post("/", zValidator("json", insertVehicleSchema), async (c) => {
    const userId = c.get("userId");
    const data = c.req.valid("json");
    const vehicle = await vehicleService.create(userId, data);
    return c.json(vehicle, 201);
  })
  .patch("/:id", zValidator("json", updateVehicleInfoSchema), async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");
    const vehicle = await vehicleService.update(id, data);
    if (!vehicle) return c.json({ error: "Vehicle not found" }, 404);
    return c.json(vehicle);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await vehicleService.remove(id);
    return c.json({ success: true });
  })
  .route("/:vehicleId/oil-changes", oilChangeRoutes)
  .route("/:vehicleId/parts", partRoutes)
  .route("/:vehicleId/expenses", expenseRoutes);
