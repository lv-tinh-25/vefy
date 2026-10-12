import { Hono, type Context } from "hono";
import { db } from "@vefy/db";
import { sql } from "drizzle-orm";
import { runDailyReminders } from "../services/reminder.service";

// Vercel Cron sends CRON_SECRET as a Bearer token
function authorized(c: Context) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && c.req.header("authorization") === `Bearer ${secret}`;
}

export const cronRoutes = new Hono()
  // Called daily (apps/web/vercel.json) so Supabase's free tier doesn't pause the project
  // after a week without traffic
  .get("/keepalive", async (c) => {
    if (!authorized(c)) return c.json({ error: "Unauthorized" }, 401);
    await db.execute(sql`select 1`);
    return c.json({ ok: true }, 200);
  })
  // Daily at 08:00 Vietnam time
  .get("/reminders", async (c) => {
    if (!authorized(c)) return c.json({ error: "Unauthorized" }, 401);
    const stats = await runDailyReminders();
    console.log("[reminders]", stats);
    return c.json(stats, 200);
  });
