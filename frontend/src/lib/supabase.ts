import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CONFIG } from "@/config/site";

export const supabase: SupabaseClient | null =
  CONFIG.supabaseUrl && CONFIG.supabaseAnonKey
    ? createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      })
    : null;
