import { getSupabaseServerClient } from "./supabase";

export interface CatalogItem {
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

export async function getToursCatalog(): Promise<{ items: CatalogItem[]; error: string | null; source: string }> {
  const supabase = getSupabaseServerClient();

  // If Supabase is not available (e.g., during static build), return empty
  if (!supabase) {
    return { items: [], error: "Supabase not available during build", source: "none" };
  }

  const { data, error } = await supabase
    .from("v_tours_catalogo")
    .select("id,titulo,descripcion,precio,duracion,ubicacion,incluye,no_incluye,itinerario,imagen_principal,galeria,destacado,estado,vendedor_id")
    .order("id", { ascending: true });

  if (error) {
    return { items: [], error: error.message, source: "none" };
  }

  const items = (data ?? []).map((row) => ({
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

  return { items, error: null, source: "v_tours_catalogo" };
}
