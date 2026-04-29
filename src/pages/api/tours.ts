import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../lib/supabase";
import { cacheConfig } from "../../lib/site-config";

export const prerender = false;

interface TourItem {
  id: number;
  titulo: string;
  descripcion: string;
  precio: string;
  duracion: string;
  ubicacion: string;
  incluye: string;
  no_incluye: string | null;
  itinerario: string | null;
  imagen_principal: string;
  galeria: string[];
  destacado: boolean;
  estado: string;
  vendedor_id: string;
  whatsapp_phone: string | null;
}

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

export const GET: APIRoute = async () => {
  try {
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Supabase not configured",
          items: [],
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase
      .from("v_tours_catalogo")
      .select(
        "id,titulo,descripcion,precio,duracion,ubicacion,incluye,no_incluye,itinerario,imagen_principal,galeria,destacado,estado,vendedor_id"
      )
      .order("id", { ascending: true });

    if (error) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: error.message,
          items: [],
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Obtener datos de WhatsApp de los vendedores
    const vendorIds = Array.from(new Set((data ?? []).map((row) => row.vendedor_id)));
    const vendorDataMap: Record<string, string | null> = {};

    if (vendorIds.length > 0) {
      const { data: vendorsData } = await supabase
        .from("vendedores")
        .select("id, whatsapp_phone")
        .in("id", vendorIds);

      if (vendorsData) {
        vendorsData.forEach((v) => {
          vendorDataMap[v.id] = v.whatsapp_phone || null;
        });
      }
    }

    const items: TourItem[] = (data ?? []).map((row) => ({
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
      whatsapp_phone: vendorDataMap[row.vendedor_id] || null,
    }));

    return new Response(JSON.stringify({ ok: true, items }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Internal server error",
        items: [],
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
