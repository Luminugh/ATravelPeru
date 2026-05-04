// Domain Service - Session validation logic (NO Supabase dependency)

export const ADMIN_ACCESS_COOKIE = "admin_access_token";
export const ADMIN_ACTIVITY_COOKIE = "admin_last_activity";

export function isIdleExpired(lastActivityRaw: string | null | undefined, idleTimeoutMs: number): boolean {
  if (!lastActivityRaw) {
    return true;
  }

  const lastActivity = Number(lastActivityRaw);
  if (!Number.isFinite(lastActivity)) {
    return true;
  }

  return Date.now() - lastActivity > idleTimeoutMs;
}

export function getCookieSecurityOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: typeof window === "undefined" ? true : location.protocol === "https:", // PROD-like detection
    path: "/",
  };
}
