import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as ocrService from "../services/ocr.service";
import * as ocrUsageService from "../services/ocr-usage.service";
import type { AuthEnv } from "../middleware/auth";

const ocrInputSchema = z.object({
  imageBase64: z.string().min(1),
});

export const ocrRoutes = new Hono<AuthEnv>().post(
  "/read-odometer",
  zValidator("json", ocrInputSchema),
  async (c) => {
    const userId = c.get("userId");
    const reservation = await ocrUsageService.reserve(userId);

    if (!reservation.ok) {
      if (reservation.reason === "daily_limit") {
        return c.json(
          { code: "OCR_DAILY_LIMIT" as const, limit: ocrUsageService.DAILY_LIMIT, retryAfter: 0 },
          429,
        );
      }
      return c.json(
        { code: "OCR_COOLDOWN" as const, limit: ocrUsageService.DAILY_LIMIT, retryAfter: reservation.retryAfter },
        429,
      );
    }

    const outcome = await ocrService.readOdometer(c.req.valid("json").imageBase64);

    if (outcome.status === "unavailable" || outcome.status === "error") {
      await ocrUsageService.refund(userId, reservation.date);
      return c.json(
        { code: "OCR_UNAVAILABLE" as const, cooldownSeconds: ocrUsageService.COOLDOWN_SECONDS },
        503,
      );
    }

    const meta = { remaining: reservation.remaining, cooldownSeconds: ocrUsageService.COOLDOWN_SECONDS };
    if (outcome.status === "unreadable") {
      return c.json({ success: false as const, code: "OCR_UNREADABLE" as const, ...meta }, 200);
    }
    return c.json({ success: true as const, km: outcome.km, ...meta }, 200);
  },
);
