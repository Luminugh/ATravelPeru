// Application Use Case - Admin Login
// Orchestrates Supabase authentication and cookie management

import type { SupabaseClient } from "@supabase/supabase-js";
import { UnauthorizedError } from "../../domain/errors/DomainError";

export interface LoginResult {
  accessToken: string;
  email: string | null;
  nombre: string | null;
}

export class LoginUseCase {
  constructor(private supabaseClient: SupabaseClient) {}

  async execute(email: string, password: string): Promise<LoginResult> {
    if (!email || !password) {
      throw new UnauthorizedError("Email y contrasena son requeridos");
    }

    const { data, error } = await this.supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.session?.access_token) {
      throw new UnauthorizedError(error?.message || "Credenciales invalidas");
    }

    return {
      accessToken: data.session.access_token,
      email: data.user?.email ?? null,
      nombre: (data.user?.user_metadata?.nombre as string | undefined) ?? null,
    };
  }
}
