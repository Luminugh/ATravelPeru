import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const projectId = import.meta.env.SUPABASE_PROJECT_ID;
  const url = import.meta.env.PUBLIC_SUPABASE_URL ?? (projectId ? `https://${projectId}.supabase.co` : undefined);
  const key =
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ??
    import.meta.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    // During build time, return null instead of throwing
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
