import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as expenseService from "../services/expense.service";
import type { AuthEnv } from "../middleware/auth";

const periodQuerySchema = z.object({
  period: z.enum(["month", "year"]).default("month"),
});

export const expensesGlobalRoutes = new Hono<AuthEnv>()
  .get("/", async (c) => {
    const userId = c.get("userId");
    const list = await expenseService.listByUser(userId);
    return c.json(list);
  })
  .get("/summary", zValidator("query", periodQuerySchema), async (c) => {
    const userId = c.get("userId");
    const { period } = c.req.valid("query");
    const summary = await expenseService.summaryByUser(userId, period);
    return c.json(summary);
  });
