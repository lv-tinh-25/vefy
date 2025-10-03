import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createOtherExpenseSchema } from "@vefy/shared";
import * as expenseService from "../services/expense.service";

const periodQuerySchema = z.object({
  period: z.enum(["month", "year"]).default("month"),
});

export const expenseRoutes = new Hono()
  .get("/", async (c) => {
    const vehicleId = c.req.param("vehicleId");
    if (!vehicleId) return c.json({ error: "Vehicle ID required" }, 400);
    const list = await expenseService.listByVehicle(vehicleId);
    return c.json(list);
  })
  .get("/summary", zValidator("query", periodQuerySchema), async (c) => {
    const vehicleId = c.req.param("vehicleId");
    if (!vehicleId) return c.json({ error: "Vehicle ID required" }, 400);
    const { period } = c.req.valid("query");
    const summary = await expenseService.summaryByVehicle(vehicleId, period);
    return c.json(summary);
  })
  .post("/", zValidator("json", createOtherExpenseSchema), async (c) => {
    const vehicleId = c.req.param("vehicleId");
    if (!vehicleId) return c.json({ error: "Vehicle ID required" }, 400);
    const data = c.req.valid("json");
    const expense = await expenseService.createOther({
      vehicleId,
      date: data.date,
      amount: data.amount,
      name: data.name,
      note: data.note,
    });
    return c.json(expense, 201);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      await expenseService.remove(id, c.req.param("vehicleId") ?? "");
      return c.json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "expense.error";
      const status = message === "expense.linkedReadonly" ? 400 : 404;
      return c.json({ error: message }, status);
    }
  });
