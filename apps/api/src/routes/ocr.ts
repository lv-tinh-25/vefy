import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import * as ocrService from "../services/ocr.service";

const ocrInputSchema = z.object({
  imageBase64: z.string().min(1),
});

export const ocrRoutes = new Hono()
  .post(
    "/read-odometer",
    zValidator("json", ocrInputSchema),
    async (c) => {
      const { imageBase64 } = c.req.valid("json");
      const result = await ocrService.readOdometer(imageBase64);
      return c.json(result);
    },
  );
