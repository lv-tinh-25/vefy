import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db, user as userTable } from "@vefy/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthEnv } from "../middleware/auth";
import * as uploadService from "../services/upload.service";

const avatarUploadSchema = z.object({
  image: z.string().refine((val) => val.startsWith("data:image/"), {
    message: "Must be a base64 data URL",
  }),
});

export const uploadRoutes = new Hono<AuthEnv>()
  .use("/*", requireAuth)
  .post(
    "/avatar",
    zValidator("json", avatarUploadSchema),
    async (c) => {
      const userId = c.get("userId");
      const { image } = c.req.valid("json");

      const publicUrl = await uploadService.uploadAvatar(userId, image);

      // Update user.image in DB with the public URL
      await db
        .update(userTable)
        .set({ image: publicUrl, updatedAt: new Date() })
        .where(eq(userTable.id, userId));

      return c.json({ url: publicUrl }, 201);
    },
  )
  .delete("/avatar", async (c) => {
    const userId = c.get("userId");

    await uploadService.deleteAvatar(userId);

    // Clear user.image in DB
    await db
      .update(userTable)
      .set({ image: null, updatedAt: new Date() })
      .where(eq(userTable.id, userId));

    return c.json({ success: true });
  });
