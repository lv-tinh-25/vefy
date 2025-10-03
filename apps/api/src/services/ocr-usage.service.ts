import { db, ocrUsage } from "@vefy/db";
import { and, eq, sql } from "drizzle-orm";
import { OCR_LIMITS, todayDateStr } from "@vefy/shared";

// Env overrides let ops (or a local test) tune limits without a code change
export const DAILY_LIMIT = Number(process.env.OCR_DAILY_LIMIT) || OCR_LIMITS.dailyPerUser;
export const COOLDOWN_SECONDS = Number(process.env.OCR_COOLDOWN_SECONDS) || OCR_LIMITS.cooldownSeconds;

export type Reservation =
  | { ok: true; date: string; remaining: number }
  | { ok: false; reason: "daily_limit" }
  | { ok: false; reason: "cooldown"; retryAfter: number };

// Single upsert so two concurrent scans can't both slip past the limit
export async function reserve(userId: string): Promise<Reservation> {
  const date = todayDateStr();
  const rows = await db
    .insert(ocrUsage)
    .values({ userId, date, count: 1 })
    .onConflictDoUpdate({
      target: [ocrUsage.userId, ocrUsage.date],
      set: { count: sql`${ocrUsage.count} + 1`, lastAt: sql`now()` },
      setWhere: sql`${ocrUsage.count} < ${DAILY_LIMIT} and ${ocrUsage.lastAt} <= now() - make_interval(secs => ${COOLDOWN_SECONDS})`,
    })
    .returning({ count: ocrUsage.count });

  if (rows[0]) return { ok: true, date, remaining: DAILY_LIMIT - rows[0].count };

  const [row] = await db
    .select()
    .from(ocrUsage)
    .where(and(eq(ocrUsage.userId, userId), eq(ocrUsage.date, date)));
  if (!row || row.count >= DAILY_LIMIT) return { ok: false, reason: "daily_limit" };

  const retryAfter = Math.ceil((row.lastAt.getTime() + COOLDOWN_SECONDS * 1000 - Date.now()) / 1000);
  return { ok: false, reason: "cooldown", retryAfter: Math.max(1, retryAfter) };
}

// Gemini outages aren't the user's fault: give the scan back (cooldown still applies)
export async function refund(userId: string, date: string): Promise<void> {
  await db
    .update(ocrUsage)
    .set({ count: sql`greatest(${ocrUsage.count} - 1, 0)` })
    .where(and(eq(ocrUsage.userId, userId), eq(ocrUsage.date, date)));
}
