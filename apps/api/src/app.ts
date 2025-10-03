import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./lib/auth";
import { getAppOrigin } from "./lib/origin";
import { requireAuth } from "./middleware/auth";
import { vehicleRoutes } from "./routes/vehicles";
import { ocrRoutes } from "./routes/ocr";
import { profileRoutes } from "./routes/profile";
import { uploadRoutes } from "./routes/upload";
import { notificationRoutes } from "./routes/notifications";
import { expensesGlobalRoutes } from "./routes/expenses-global";
import { cronRoutes } from "./routes/cron";

const FRONTEND_URL = getAppOrigin();

const app = new Hono()
  .use(
    "/*",
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    }),
  )
  .get("/api/health", (c) => c.json({ status: "ok" }))
  .route("/api/cron", cronRoutes)
  // Better Auth handles all /api/auth/* routes (all HTTP methods)
  .all("/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  })
  // Profile & Upload (authenticated)
  .route("/api/profile", profileRoutes)
  .route("/api/upload", uploadRoutes)
  // Protected routes
  .use("/api/vehicles/*", requireAuth)
  .route("/api/vehicles", vehicleRoutes)
  .use("/api/expenses/*", requireAuth)
  .route("/api/expenses", expensesGlobalRoutes)
  .use("/api/ocr/*", requireAuth)
  .route("/api/ocr", ocrRoutes)
  .use("/api/notifications/*", requireAuth)
  .route("/api/notifications", notificationRoutes);

export type AppType = typeof app;
export { app };
