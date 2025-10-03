import { hc } from "hono/client";
import type { AppType } from "@vefy/api/client";

// Same origin: the API is mounted at /api inside this Next app
export const api = hc<AppType>("/");
