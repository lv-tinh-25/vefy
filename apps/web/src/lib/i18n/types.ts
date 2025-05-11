import type { vi } from "./messages/vi";

/** Supported locales */
export type Locale = "vi" | "en";

/** Recursively map all leaf values to string */
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? DeepStringify<T[K]> : string;
};

/** Message dictionary shape — same structure as Vietnamese, all values are string */
export type Messages = DeepStringify<typeof vi>;

/** Recursively flatten nested keys into dot-notation paths */
type FlattenKeys<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? FlattenKeys<T[K], Prefix extends "" ? K : `${Prefix}.${K}`>
    : Prefix extends "" ? K : `${Prefix}.${K}`;
}[keyof T & string];

/** All valid translation keys (type-safe autocomplete) */
export type MessageKey = FlattenKeys<typeof vi>;
