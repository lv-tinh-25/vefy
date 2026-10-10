import { z } from "zod";

/**
 * Cleared number inputs hold null (undefined would make React Hook Form fall back to the default
 * value), and z.coerce turns null into 0. Mapping null/"" to undefined first makes required
 * fields fail with their invalid_type_error and leaves optional ones unset.
 *
 * Typed as the inner schema so form resolvers keep a number input type instead of unknown.
 */
export function emptyAsUndefined<T extends z.ZodTypeAny>(schema: T): T {
  return z.preprocess((v) => (v === null || v === "" ? undefined : v), schema) as unknown as T;
}
