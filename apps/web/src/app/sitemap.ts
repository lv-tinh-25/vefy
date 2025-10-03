import type { MetadataRoute } from "next";
import { getAppOrigin } from "@vefy/api/origin";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getAppOrigin();
  return ["/auth/login", "/auth/register"].map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: "monthly",
    priority: path === "/auth/login" ? 1 : 0.8,
  }));
}
