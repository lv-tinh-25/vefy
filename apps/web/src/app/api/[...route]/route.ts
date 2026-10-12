import { handle } from "hono/vercel";
import { app } from "@vefy/api/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// OCR waits on Gemini; the daily reminder job walks every vehicle
export const maxDuration = 60;

const handler = handle(app);

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS };
