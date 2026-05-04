// Application Use Case - Update Tour
// Updates tour details (gallery management is done via media_references)

import type { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../../domain/errors/DomainError";

export interface UpdateTourInput {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  duracion: string;
  ubicacion_id: number;
  incluye: string;
  no_incluye?: string | null;
  itinerario?: string | null;
  imagen_principal?: string | null;
  destacado?: boolean;
  estado?: string;
}

export class UpdateTourUseCase {
  constructor(private supabaseClient: SupabaseClient) {}

  async execute(input: UpdateTourInput): Promise<void> {
    const id = Number(input.id);
    if (!Number.isFinite(id) || id <= 0) {
      throw new ValidationError("ID invalido");
    }

    const updatePayload = {
      titulo: String(input.titulo ?? "").trim(),
      descripcion: String(input.descripcion ?? "").trim(),
      precio: Number(input.precio ?? 0),
      duracion: String(input.duracion ?? "").trim(),
      ubicacion_id: Number(input.ubicacion_id),
      incluye: String(input.incluye ?? "").trim(),
      no_incluye: input.no_incluye ? String(input.no_incluye) : null,
      itinerario: input.itinerario ? String(input.itinerario) : null,
      imagen_principal: input.imagen_principal ? String(input.imagen_principal) : null,
      destacado: Boolean(input.destacado),
      estado: input.estado === "inactivo" ? "inactivo" : "activo",
    };

    const { error } = await this.supabaseClient
      .from("tours")
      .update(updatePayload)
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
