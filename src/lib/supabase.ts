import { createClient } from "@supabase/supabase-js";

export function getSupabaseServerClient() {
  const projectId = import.meta.env.SUPABASE_PROJECT_ID;
  const publicUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const url = publicUrl ?? (projectId ? `https://${projectId}.supabase.co` : undefined);
  
  const anonKey =
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ??
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anonKey) {
    console.log("[Supabase] Missing credentials:", {
      hasUrl: !!url,
      hasAnonKey: !!anonKey,
      url: url?.substring(0, 20) + "...",
    });
    return null;
  }

  try {
    const client = createClient(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log("[Supabase] Client initialized successfully");
    return client;
  } catch (error) {
    console.log("[Supabase] Error creating client:", error);
    return null;
  }
}
