// Application Use Case - Delete Tour
// Deletes a tour and its gallery

import type { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../../domain/errors/DomainError";

export class DeleteTourUseCase {
  constructor(private supabaseClient: SupabaseClient) {}

  async execute(tourId: number): Promise<void> {
    const id = Number(tourId);
    if (!Number.isFinite(id) || id <= 0) {
      throw new ValidationError("ID invalido");
    }

    const { error } = await this.supabaseClient.from("tours").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
