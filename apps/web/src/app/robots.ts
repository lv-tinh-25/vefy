import type { MetadataRoute } from "next";
import { getAppOrigin } from "@vefy/api/origin";

// Everything behind login is private; only the auth entry pages are worth crawling
export default function robots(): MetadataRoute.Robots {
  const origin = getAppOrigin();
  return {
    rules: { userAgent: "*", allow: ["/auth/login", "/auth/register"], disallow: ["/"] },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
