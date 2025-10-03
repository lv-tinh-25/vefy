import { afterEach, describe, expect, it, vi } from "vitest";
import { getAppOrigin } from "../lib/origin";

afterEach(() => vi.unstubAllEnvs());

function stub(env: Record<string, string>) {
  for (const key of ["VERCEL_ENV", "VERCEL_URL", "FRONTEND_URL", "VERCEL_PROJECT_PRODUCTION_URL"]) {
    vi.stubEnv(key, env[key] ?? "");
  }
}

describe("getAppOrigin", () => {
  it("defaults to localhost", () => {
    stub({});
    expect(getAppOrigin()).toBe("http://localhost:3000");
  });

  it("prefers FRONTEND_URL and trims a trailing slash", () => {
    stub({ FRONTEND_URL: "https://vefy.app/", VERCEL_PROJECT_PRODUCTION_URL: "vefy.vercel.app" });
    expect(getAppOrigin()).toBe("https://vefy.app");
  });

  it("falls back to the Vercel production domain", () => {
    stub({ VERCEL_ENV: "production", VERCEL_PROJECT_PRODUCTION_URL: "vefy.vercel.app" });
    expect(getAppOrigin()).toBe("https://vefy.vercel.app");
  });

  it("uses the deployment URL on previews", () => {
    stub({ VERCEL_ENV: "preview", VERCEL_URL: "vefy-git-x.vercel.app", FRONTEND_URL: "https://vefy.app" });
    expect(getAppOrigin()).toBe("https://vefy-git-x.vercel.app");
  });
});
