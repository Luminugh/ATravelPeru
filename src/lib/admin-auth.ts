import { createClient } from "@supabase/supabase-js";

export const ADMIN_ACCESS_COOKIE = "admin_access_token";
export const ADMIN_ACTIVITY_COOKIE = "admin_last_activity";

function envNumber(name: string, fallback: number): number {
  const raw = import.meta.env[name];
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const ADMIN_IDLE_TIMEOUT_MS = envNumber("PUBLIC_ADMIN_IDLE_TIMEOUT_MS", 15 * 60 * 1000);

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

export function isIdleExpired(lastActivityRaw?: string | null) {
  if (!lastActivityRaw) {
    return true;
  }

  const lastActivity = Number(lastActivityRaw);
  if (!Number.isFinite(lastActivity)) {
    return true;
  }

  return Date.now() - lastActivity > ADMIN_IDLE_TIMEOUT_MS;
}

export function getCookieSecurityOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: import.meta.env.PROD,
    path: "/",
  };
}
