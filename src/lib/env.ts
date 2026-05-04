// Utility functions - Config & environment helpers
// Moved from lib/admin-auth.ts and kept as utils

export function envNumber(name: string, fallback: number): number {
  const raw = import.meta.env[name];
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const ADMIN_IDLE_TIMEOUT_MS = envNumber("PUBLIC_ADMIN_IDLE_TIMEOUT_MS", 15 * 60 * 1000);
