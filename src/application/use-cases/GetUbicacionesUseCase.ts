// Application Use Case - Get Ubicaciones (Locations)
// Fetches list of available tour locations

import type { SupabaseClient } from "@supabase/supabase-js";

export interface Ubicacion {
  id: string;
  nombre: string;
}

export class GetUbicacionesUseCase {
  constructor(private supabaseClient: SupabaseClient) {}

  async execute(): Promise<Ubicacion[]> {
    const { data, error } = await this.supabaseClient
      .from("ubicaciones")
      .select("id,nombre")
      .order("nombre", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as Ubicacion[];
  }
}
