import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createUnsubscribeToken, verifyUnsubscribeToken } from "../lib/unsubscribe-token";

beforeEach(() => vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-test-secret-test-secret"));
afterEach(() => vi.unstubAllEnvs());

describe("unsubscribe token", () => {
  it("round-trips the user id", () => {
    expect(verifyUnsubscribeToken(createUnsubscribeToken("user-123"))).toBe("user-123");
  });

  it("rejects a token for another user or a tampered signature", () => {
    const [, signature] = createUnsubscribeToken("user-123").split(".");
    const forged = `${Buffer.from("user-456").toString("base64url")}.${signature}`;
    expect(verifyUnsubscribeToken(forged)).toBeNull();
    expect(verifyUnsubscribeToken(`${createUnsubscribeToken("user-123")}x`)).toBeNull();
    expect(verifyUnsubscribeToken("garbage")).toBeNull();
  });

  it("stops working when the secret changes", () => {
    const token = createUnsubscribeToken("user-123");
    vi.stubEnv("BETTER_AUTH_SECRET", "another-secret-another-secret-123");
    expect(verifyUnsubscribeToken(token)).toBeNull();
  });
});
