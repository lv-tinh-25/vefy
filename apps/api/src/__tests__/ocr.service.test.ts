import { describe, expect, it, vi } from "vitest";
import { ApiError } from "@google/genai";
import { generateWithFallback, isQuotaError, parseKm } from "../services/ocr.service";

const quotaError = () => new ApiError({ message: "RESOURCE_EXHAUSTED", status: 429 });

describe("generateWithFallback", () => {
  it("uses the first model when it succeeds", async () => {
    const call = vi.fn(async (model: string) => model);
    expect(await generateWithFallback(["a", "b"], call)).toBe("a");
    expect(call).toHaveBeenCalledTimes(1);
  });

  it("falls back to the next model on quota errors", async () => {
    const call = vi.fn(async (model: string) => {
      if (model === "a") throw quotaError();
      return model;
    });
    expect(await generateWithFallback(["a", "b"], call)).toBe("b");
  });

  it("returns null when every model is out of quota", async () => {
    expect(await generateWithFallback(["a", "b"], async () => Promise.reject(quotaError()))).toBeNull();
  });

  it("rethrows other errors without trying the next model", async () => {
    const call = vi.fn(async () => Promise.reject(new ApiError({ message: "bad key", status: 403 })));
    await expect(generateWithFallback(["a", "b"], call)).rejects.toThrow("bad key");
    expect(call).toHaveBeenCalledTimes(1);
  });
});

describe("isQuotaError", () => {
  it("only matches 429 ApiErrors", () => {
    expect(isQuotaError(quotaError())).toBe(true);
    expect(isQuotaError(new Error("x"))).toBe(false);
  });
});

describe("parseKm", () => {
  it.each([
    ["45230", 45230],
    ["45,230 km", 45230],
    ["ERROR", null],
    ["0", null],
    ["", null],
    ["no digits", null],
  ])("%s -> %s", (input, expected) => {
    expect(parseKm(input)).toBe(expected);
  });
});
