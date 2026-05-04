// Application Use Case - Update Account
// Updates vendor name and phone

import type { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../../domain/errors/DomainError";

export interface UpdateAccountResult {
  nombre: string;
  telefono: string | null;
}

export class UpdateAccountUseCase {
  constructor(private supabaseClient: SupabaseClient) {}

  async execute(userId: string, nombre: string, telefono?: string): Promise<UpdateAccountResult> {
    // Validate input
    const cleanedNombre = String(nombre ?? "").trim();
    const cleanedTelefono = String(telefono ?? "").trim();

    if (!cleanedNombre) {
      throw new ValidationError("El nombre es requerido");
    }

    const finalTelefono = cleanedTelefono.length > 0 ? cleanedTelefono : null;

    // Ensure the user profile exists
    const existingUser = await this.supabaseClient
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existingUser.error) {
      throw new Error(existingUser.error.message);
    }

    if (!existingUser.data) {
      const insertRes = await this.supabaseClient
        .from("users")
        .insert({
          id: userId,
          email: null,
          nombre: cleanedNombre,
          telefono: finalTelefono,
          role: "vendedor",
        });

      if (insertRes.error) {
        throw new Error(insertRes.error.message);
      }

      return {
        nombre: cleanedNombre,
        telefono: finalTelefono,
      };
    }

    const { error: updateError } = await this.supabaseClient
      .from("users")
      .update({ nombre: cleanedNombre, telefono: finalTelefono })
      .eq("id", userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return {
      nombre: cleanedNombre,
      telefono: finalTelefono,
    };
  }
}
