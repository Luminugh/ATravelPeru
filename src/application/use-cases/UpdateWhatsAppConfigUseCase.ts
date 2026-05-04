// Application Use Case - Update WhatsApp Config
// Validates and updates the global WhatsApp phone number

import type { SupabaseClient } from "@supabase/supabase-js";
import { UnauthorizedError, ValidationError } from "../../domain/errors/DomainError";

export class UpdateWhatsAppConfigUseCase {
  constructor(private supabaseClient: SupabaseClient) {}

  async execute(userId: string, phone: string): Promise<{ phone: string }> {
    // Verify user has admin or vendedor role
    const userCheck = await this.supabaseClient
      .from("users")
      .select("role")
      .eq("id", userId)
      .in("role", ["admin", "vendedor"])
      .maybeSingle();

    if (!userCheck.data) {
      throw new UnauthorizedError("El usuario no tiene permisos de vendedor/admin");
    }

    // Validate phone input
    if (typeof phone !== "string" || phone.trim().length === 0) {
      throw new ValidationError("El número de teléfono es requerido");
    }

    const cleanedPhone = this.cleanPhoneNumber(phone);
    if (cleanedPhone.length < 9) {
      throw new ValidationError("El número debe tener al menos 9 dígitos");
    }

    // Update config
    const { error } = await this.supabaseClient.from("app_config").upsert(
      {
        config_key: "whatsapp_phone",
        config_value: cleanedPhone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "config_key" }
    );

    if (error) {
      throw new Error(error.message);
    }

    return { phone: cleanedPhone };
  }

  private cleanPhoneNumber(phone: string): string {
    return (phone ?? "").replace(/\D/g, "");
  }
}
