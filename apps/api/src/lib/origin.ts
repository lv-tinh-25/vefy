// Public origin of the web app (which also serves this API).
// Preview deployments use their own URL so auth cookies/redirects stay on that host;
// production falls back to the domain Vercel provides, so FRONTEND_URL is optional there.
export function getAppOrigin(): string {
  const env = process.env;
  if (env.VERCEL_ENV === "preview" && env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  if (env.FRONTEND_URL) return env.FRONTEND_URL.replace(/\/$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
