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
  galeria?: Array<{ imagen: string; orden?: number }>;
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

    // If gallery provided, rebuild media_references for this tour
    try {
      const gal = Array.isArray(input.galeria) ? input.galeria : null;
      if (gal && gal.length >= 0) {
        // remove existing gallery references for this tour
        const { error: delErr } = await this.supabaseClient
          .from("tour_media")
          .delete()
          .eq("tour_id", id)
          .eq("role", "gallery");
        if (delErr) {
          throw new Error(delErr.message);
        }

        const refs: Array<Record<string, unknown>> = [];
        for (let i = 0; i < gal.length; i++) {
          const item = gal[i];
          const url = String(item?.imagen ?? "").trim();
          if (!url) continue;

          const { data: mf } = await this.supabaseClient
            .from("media_files")
            .select("id")
            .eq("url", url)
            .maybeSingle();

          let mediaId: string | undefined;
          if (mf && (mf as any).id) {
            mediaId = (mf as any).id;
          } else {
            const filename = url.split("/").pop() || null;
            const { data: newMf, error: newMfErr } = await this.supabaseClient
              .from("media_files")
              .insert({ url, filename })
              .select("id")
              .single();
            if (newMf && (newMf as any).id) mediaId = (newMf as any).id;
            if (newMfErr) continue;
          }

          if (mediaId) {
            refs.push({
              tour_id: id,
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
      }
    } catch (e) {
      console.warn("Warning: no fue posible actualizar referencias de galería:", e instanceof Error ? e.message : e);
    }
  }
}
