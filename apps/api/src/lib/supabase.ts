import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn(
    "[Supabase Storage] SUPABASE_URL or SUPABASE_SERVICE_KEY not set — avatar upload will fail",
  );
}

export const supabase = createClient(
  SUPABASE_URL || "",
  SUPABASE_SERVICE_KEY || "",
);
