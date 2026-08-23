import type { SupabaseClient } from "@supabase/supabase-js";

/** Throws unless the calling user has the admin role (checked as that user, via RLS). */
export async function assertAdmin(context: {
  supabase: SupabaseClient<any, any, any>;
  userId: string;
}) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin access required");
}
