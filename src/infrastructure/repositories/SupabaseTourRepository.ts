// Infrastructure Repository - Tours
// Implements ITourRepository from domain

import type { Tour, ITourRepository } from "../../domain/models/repositories";
import { getSupabaseServerClient } from "../supabase/SupabaseClientFactory";

function formatPrice(value: unknown): string {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) {
    return "S/ 0";
  }

  return `S/ ${numericValue.toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function normalizeGallery(galeria: unknown): string[] {
  if (!Array.isArray(galeria)) {
    return [];
  }

  return galeria
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }
      if (item && typeof item === "object" && "imagen" in item) {
        return (item as { imagen?: string }).imagen ?? null;
      }
      return null;
    })
    .filter((url): url is string => Boolean(url));
}

export class SupabaseTourRepository implements ITourRepository {
  async findAll(): Promise<Tour[]> {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    try {
      const { data, error } = await supabase
        .from("v_tours_catalogo")
        .select(
          "id,titulo,descripcion,precio,duracion,ubicacion,incluye,no_incluye,itinerario,imagen_principal,galeria,destacado,estado,vendedor_id"
        )
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        titulo: row.titulo,
        descripcion: row.descripcion,
        precio: formatPrice(row.precio),
        duracion: row.duracion,
        ubicacion: row.ubicacion,
        incluye: row.incluye,
        no_incluye: row.no_incluye,
        itinerario: row.itinerario,
        imagen_principal: row.imagen_principal,
        galeria: normalizeGallery(row.galeria),
        destacado: Boolean(row.destacado),
        estado: row.estado,
        vendedor_id: row.vendedor_id,
      }));
    } catch (error) {
      console.error("[TourRepository] Error fetching all tours:", error);
      throw error;
    }
  }

  async findById(id: number): Promise<Tour | null> {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    try {
      const { data, error } = await supabase
        .from("v_tours_catalogo")
        .select(
          "id,titulo,descripcion,precio,duracion,ubicacion,incluye,no_incluye,itinerario,imagen_principal,galeria,destacado,estado,vendedor_id"
        )
        .eq("id", id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        titulo: data.titulo,
        descripcion: data.descripcion,
        precio: formatPrice(data.precio),
        duracion: data.duracion,
        ubicacion: data.ubicacion,
        incluye: data.incluye,
        no_incluye: data.no_incluye,
        itinerario: data.itinerario,
        imagen_principal: data.imagen_principal,
        galeria: normalizeGallery(data.galeria),
        destacado: Boolean(data.destacado),
        estado: data.estado,
        vendedor_id: data.vendedor_id,
      };
    } catch (error) {
      console.error(`[TourRepository] Error fetching tour ${id}:`, error);
      throw error;
    }
  }

  async findByVendorId(vendorId: string): Promise<Tour[]> {
    const supabase = getSupabaseServerClient();
    if (!supabase) {
      throw new Error("Supabase client not available");
    }

    try {
      const { data, error } = await supabase
        .from("v_tours_catalogo")
        .select(
          "id,titulo,descripcion,precio,duracion,ubicacion,incluye,no_incluye,itinerario,imagen_principal,galeria,destacado,estado,vendedor_id"
        )
        .eq("vendedor_id", vendorId)
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        titulo: row.titulo,
        descripcion: row.descripcion,
        precio: formatPrice(row.precio),
        duracion: row.duracion,
        ubicacion: row.ubicacion,
        incluye: row.incluye,
        no_incluye: row.no_incluye,
        itinerario: row.itinerario,
        imagen_principal: row.imagen_principal,
        galeria: normalizeGallery(row.galeria),
        destacado: Boolean(row.destacado),
        estado: row.estado,
        vendedor_id: row.vendedor_id,
      }));
    } catch (error) {
      console.error(`[TourRepository] Error fetching tours for vendor ${vendorId}:`, error);
      throw error;
    }
  }
}
