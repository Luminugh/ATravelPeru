// Application Use Case - Create Tour
// Creates a new tour (gallery management is done via media_references)

import type { SupabaseClient } from "@supabase/supabase-js";
import { ValidationError } from "../../domain/errors/DomainError";

export interface CreateTourInput {
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

export class CreateTourUseCase {
  constructor(private supabaseClient: SupabaseClient) {}

  async execute(vendorId: string, input: CreateTourInput): Promise<{ id: number }> {
    const insertPayload = {
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
      vendedor_id: vendorId,
    };

    const { data, error } = await this.supabaseClient
      .from("tours")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error || !data?.id) {
      throw new Error(error?.message ?? "No fue posible crear el tour");
    }

    return { id: data.id };
  }
}
