import { createClient } from "@supabase/supabase-js";

function getSupabaseEnv() {
  const projectId = import.meta.env.SUPABASE_PROJECT_ID;
  const publicUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const url = publicUrl ?? (projectId ? `https://${projectId}.supabase.co` : undefined);

  const anonKey =
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ??
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getSupabaseServerClient() {
  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  try {
    return createClient(env.url, env.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  } catch {
    return null;
  }
}
