// Application Use Case - Get Account Info
// Fetches vendor account info with metrics

import type { SupabaseClient } from "@supabase/supabase-js";
import { UnauthorizedError } from "../../domain/errors/DomainError";
import { isIdleExpired } from "../../domain/services/SessionService";
import { ADMIN_IDLE_TIMEOUT_MS } from "../../lib/env";

export interface AccountInfo {
  user: {
    id: string;
    email: string | null;
    nombre: string | null;
    created_at: string;
  };
  vendedor: {
    id: string;
    nombre: string | null;
    telefono: string | null;
    created_at: string | null;
  };
  metrics: {
    tours: number;
  };
}

export class GetAccountUseCase {
  constructor(private supabaseClient: SupabaseClient) {}

  async execute(accessToken: string, lastActivityRaw?: string | null): Promise<AccountInfo> {
    if (!accessToken) {
      throw new UnauthorizedError("No autenticado");
    }

    if (isIdleExpired(lastActivityRaw, ADMIN_IDLE_TIMEOUT_MS)) {
      throw new UnauthorizedError("Sesion expirada por inactividad");
    }

    const { data: userData, error: userError } = await this.supabaseClient.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      throw new UnauthorizedError("Sesion invalida");
    }

    const userId = userData.user.id;

    const [userRes, toursRes] = await Promise.all([
      this.supabaseClient
        .from("users")
        .select("id,nombre,telefono,created_at,role")
        .eq("id", userId)
        .maybeSingle(),
      this.supabaseClient
        .from("tours")
        .select("id", { count: "exact", head: true })
        .eq("vendedor_id", userId),
    ]);

    if (userRes.error) {
      throw new Error(userRes.error.message);
    }

    return {
      user: {
        id: userData.user.id,
        email: userData.user.email ?? null,
        nombre: (userData.user.user_metadata?.nombre as string | undefined) ?? null,
        created_at: userData.user.created_at,
      },
      vendedor: userRes.data ?? {
        id: userData.user.id,
        nombre: (userData.user.user_metadata?.nombre as string | undefined) ?? null,
        telefono: null,
        created_at: null,
      },
      metrics: {
        tours: toursRes.count ?? 0,
      },
    };
  }
}
