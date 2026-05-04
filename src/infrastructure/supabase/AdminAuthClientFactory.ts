// Infrastructure - Supabase Client Factory
// Moved from lib/admin-auth.ts

import { createClient } from "@supabase/supabase-js";

function resolveSupabaseEnv() {
  const projectId = import.meta.env.SUPABASE_PROJECT_ID;
  const url = import.meta.env.PUBLIC_SUPABASE_URL ?? (projectId ? `https://${projectId}.supabase.co` : undefined);
  const key =
    import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.SUPABASE_PUBLISHABLE_KEY ??
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ??
    import.meta.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars for admin auth.");
  }

  return { url, key };
}

export function createSupabasePublicClient() {
  const { url, key } = resolveSupabaseEnv();
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createSupabaseAuthedClient(accessToken: string) {
  const { url, key } = resolveSupabaseEnv();
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

export function createSupabaseServiceClient() {
  const projectId = import.meta.env.SUPABASE_PROJECT_ID;
  const url = import.meta.env.PUBLIC_SUPABASE_URL ?? (projectId ? `https://${projectId}.supabase.co` : undefined);
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase service role key or URL for server-side storage operations. Set SUPABASE_SERVICE_ROLE_KEY and PUBLIC_SUPABASE_URL in your environment.'
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
