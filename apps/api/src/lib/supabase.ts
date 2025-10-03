import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// Created on first use: createClient throws without a URL, which would break builds
// (CI, or a Vercel build before env vars are set) just by importing this module
export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set for avatar uploads");
    client = createClient(url, key);
  }
  return client;
}
