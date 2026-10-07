import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";
import { getSupabaseServerEnv } from "@/lib/env.server";

/** Client com service role: ignora RLS. Usar só em código de servidor confiável. */
export function createAdminClient() {
  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    getSupabaseServerEnv().SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
