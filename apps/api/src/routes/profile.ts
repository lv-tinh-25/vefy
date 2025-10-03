import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { completeProfileSchema, updateProfileSchema } from "@vefy/shared";
import { db, user as userTable, account as accountTable } from "@vefy/db";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthEnv } from "../middleware/auth";

async function getAuthMethods(userId: string): Promise<string[]> {
  const accounts = await db
    .select({ providerId: accountTable.providerId })
    .from(accountTable)
    .where(eq(accountTable.userId, userId));
  return accounts.map((a) => a.providerId);
}

export const profileRoutes = new Hono<AuthEnv>()
  .use("/*", requireAuth)
  .get("/me", async (c) => {
    const userId = c.get("userId");
    const [row] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId));

    if (!row) return c.json({ error: "User not found" }, 404);

    const authMethods = await getAuthMethods(userId);

    return c.json({
      id: row.id,
      name: row.name,
      email: row.email,
      emailVerified: row.emailVerified,
      image: row.image,
      profileCompleted: row.profileCompleted,
      authMethods,
    });
  })
  .patch(
    "/complete",
    zValidator("json", completeProfileSchema),
    async (c) => {
      const userId = c.get("userId");
      const data = c.req.valid("json");

      const [row] = await db
        .update(userTable)
        .set({
          name: data.name,
          image: data.image || null,
          profileCompleted: true,
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, userId))
        .returning();

      if (!row) return c.json({ error: "User not found" }, 404);

      return c.json({
        id: row.id,
        name: row.name,
        email: row.email,
        image: row.image,
        profileCompleted: row.profileCompleted,
      });
    },
  )
  .patch(
    "/update",
    zValidator("json", updateProfileSchema),
    async (c) => {
      const userId = c.get("userId");
      const data = c.req.valid("json");

      const [row] = await db
        .update(userTable)
        .set({
          name: data.name,
          image: data.image || null,
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, userId))
        .returning();

      if (!row) return c.json({ error: "User not found" }, 404);

      const authMethods = await getAuthMethods(userId);

      return c.json({
        id: row.id,
        name: row.name,
        email: row.email,
        emailVerified: row.emailVerified,
        image: row.image,
        profileCompleted: row.profileCompleted,
        authMethods,
      });
    },
  );
