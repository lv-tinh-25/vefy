import { Hono } from "hono";
import { db } from "@vefy/db";
import { sql } from "drizzle-orm";

// Called daily by Vercel Cron (apps/web/vercel.json) so Supabase's free tier
// doesn't pause the project after a week without traffic
export const cronRoutes = new Hono().get("/keepalive", async (c) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || c.req.header("authorization") !== `Bearer ${secret}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  await db.execute(sql`select 1`);
  return c.json({ ok: true }, 200);
});
