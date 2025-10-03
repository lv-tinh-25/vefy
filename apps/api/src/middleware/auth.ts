import type { Context, Next } from "hono";
import { auth } from "../lib/auth";

export type AuthEnv = {
  Variables: {
    userId: string;
    session: Awaited<ReturnType<typeof auth.api.getSession>>;
  };
};

export async function requireAuth(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("userId" as never, session.user.id);
  c.set("session" as never, session);
  await next();
}
