// Application Use Case - Ping Session
// Validates token and confirms session is still active

import type { SupabaseClient } from "@supabase/supabase-js";
import { UnauthorizedError } from "../../domain/errors/DomainError";

export class PingSessionUseCase {
  constructor(private supabaseClient: SupabaseClient) {}

  async execute(accessToken: string): Promise<void> {
    if (!accessToken) {
      throw new UnauthorizedError("No autenticado");
    }

    const { error } = await this.supabaseClient.auth.getUser(accessToken);

    if (error) {
      throw new UnauthorizedError("Sesion invalida");
    }

    // Session is valid
  }
}
