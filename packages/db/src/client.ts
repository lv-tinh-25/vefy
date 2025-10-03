import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

const connectionString = process.env.DATABASE_URL!;

// Next dev re-evaluates this module on every hot reload; reuse one pool instead of leaking
// connections until Supabase's pooler limit is hit
const globalForDb = globalThis as typeof globalThis & { vefyPgClient?: postgres.Sql };

const client =
  globalForDb.vefyPgClient ??
  // Supabase transaction pooler (needed on serverless) does not support prepared statements
  postgres(connectionString, { prepare: false, max: 5 });

if (process.env.NODE_ENV !== "production") globalForDb.vefyPgClient = client;

export const db = drizzle(client, { schema });
export type Database = typeof db;
