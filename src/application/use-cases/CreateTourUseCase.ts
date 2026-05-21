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
  galeria?: Array<{ imagen: string; orden?: number }>; 
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

    // If gallery provided, resolve media_files and create media_references rows
    try {
      const gal = Array.isArray(input.galeria) ? input.galeria : [];
      const refs: Array<Record<string, unknown>> = [];

      for (let i = 0; i < gal.length; i++) {
        const item = gal[i];
        const url = String(item?.imagen ?? "").trim();
        if (!url) continue;

        // Try to find existing media_files record by URL
        const { data: mf } = await this.supabaseClient
          .from("media_files")
          .select("id")
          .eq("url", url)
          .maybeSingle();

        let mediaId: string | undefined;
        if (mf && (mf as any).id) {
          mediaId = (mf as any).id;
        } else {
          // Create minimal media_files entry when missing
          const filename = url.split("/").pop() || null;
          const { data: newMf, error: newMfErr } = await this.supabaseClient
            .from("media_files")
            .insert({ url, filename })
            .select("id")
            .single();
          if (newMf && (newMf as any).id) mediaId = (newMf as any).id;
          if (newMfErr) {
            // skip this item on error
            continue;
          }
        }

        if (mediaId) {
          refs.push({
            tour_id: data.id,
            media_id: mediaId,
            role: "gallery",
            orden: Number(item?.orden ?? refs.length + 1),
            meta: null,
          });
        }
      }

      if (refs.length > 0) {
        const { error: refErr } = await this.supabaseClient.from("tour_media").insert(refs);
        if (refErr) {
          throw new Error(refErr.message);
        }
      }
    } catch (e) {
      // Non-fatal: log and continue; the tour exists but gallery linkage failed
      console.warn("Warning: no fue posible crear referencias de galería:", e instanceof Error ? e.message : e);
    }

    return { id: data.id };
  }
}
