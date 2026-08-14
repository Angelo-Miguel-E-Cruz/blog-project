import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Service-role client — server-side only, never exposed to the frontend.
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
