// Application Use Case - Get Current User
// Fetches authenticated user info and validates session

import type { SupabaseClient } from "@supabase/supabase-js";
import { UnauthorizedError } from "../../domain/errors/DomainError";
import { isIdleExpired } from "../../domain/services/SessionService";
import { ADMIN_IDLE_TIMEOUT_MS } from "../../lib/env";

export interface CurrentUserResult {
  email: string | null;
  nombre: string | null;
  telefono?: string | null;
}

export class GetCurrentUserUseCase {
  constructor(private supabaseClient: SupabaseClient) {}

  async execute(
    accessToken: string,
    lastActivityRaw?: string | null
  ): Promise<CurrentUserResult> {
    if (!accessToken) {
      throw new UnauthorizedError("No autenticado");
    }

    if (isIdleExpired(lastActivityRaw, ADMIN_IDLE_TIMEOUT_MS)) {
      throw new UnauthorizedError("Sesion expirada por inactividad");
    }

    const { data, error } = await this.supabaseClient.auth.getUser(accessToken);

    if (error || !data?.user) {
      throw new UnauthorizedError("Usuario no encontrado o token invalido");
    }

    // Fetch user profile info if available
    const userRes = await this.supabaseClient
      .from("users")
      .select("nombre,telefono,role")
      .eq("id", data.user.id)
      .maybeSingle();

    const displayName = userRes.data?.nombre?.trim() || (data.user.user_metadata?.nombre as string | undefined) || null;

    return {
      email: data.user.email ?? null,
      nombre: displayName,
      telefono: userRes.data?.telefono ?? null,
    };
  }
}
