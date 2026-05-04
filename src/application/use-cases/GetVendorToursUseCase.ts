// Application Use Case - Get Vendor Tours
// Lists all tours (for admin panel showing all tours)

import type { SupabaseClient } from "@supabase/supabase-js";

export interface TourItem {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  duracion: string;
  ubicacion_id: number;
  ubicacion: string;
  incluye: string;
  no_incluye: string | null;
  itinerario: string | null;
  imagen_principal: string;
  destacado: boolean;
  estado: string;
  vendedor_id: string;
  galeria: any[];
  created_at: string;
  updated_at: string;
}

export class GetVendorToursUseCase {
  constructor(private supabaseClient: SupabaseClient) {}

  async execute(): Promise<TourItem[]> {
    // Use the view that already has media references aggregated
    const { data, error } = await this.supabaseClient
      .from("v_tours_catalogo")
      .select(
        "id,titulo,descripcion,precio,duracion,ubicacion_id,ubicacion,incluye,no_incluye,itinerario,imagen_principal,destacado,estado,vendedor_id,galeria,created_at,updated_at"
      )
      .order("id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data ?? []) as any[];
    return rows.map((row) => ({
      ...row,
      precio: typeof row.precio === "string" ? Number(row.precio) : row.precio,
      ubicacion_id: typeof row.ubicacion_id === "string" ? Number(row.ubicacion_id) : row.ubicacion_id,
      destacado: Boolean(row.destacado),
      galeria: Array.isArray(row.galeria) ? row.galeria : [],
    })) as TourItem[];
  }
}
