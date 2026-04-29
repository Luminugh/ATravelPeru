import { getSupabaseServerClient } from "./supabase";
import { loadCachedTours, saveCachedTours } from "./cache";

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

  // Try to fetch from Supabase
  if (supabase) {
    try {
      console.log("[Tours] Fetching from Supabase...");
      const { data, error } = await supabase
        .from("v_tours_catalogo")
        .select("id,titulo,descripcion,precio,duracion,ubicacion,incluye,no_incluye,itinerario,imagen_principal,galeria,destacado,estado,vendedor_id")
        .order("id", { ascending: true });

      if (error) {
        console.warn("[Tours] Supabase error:", error.message);
      } else if (data && data.length > 0) {
        console.log(`[Tours] Got ${data.length} tours from Supabase`);
        const items = data.map((row) => ({
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
        
        // Try to save to cache for future builds
        try {
          await saveCachedTours(items);
        } catch (cacheErr) {
          console.log("[Tours] Could not save cache:", cacheErr);
        }
        
        return { items, error: null, source: "supabase" };
      } else {
        console.log("[Tours] Supabase returned empty data");
      }
    } catch (err) {
      console.warn("[Tours] Supabase fetch failed:", err instanceof Error ? err.message : String(err));
    }
  } else {
    console.log("[Tours] Supabase client not available");
  }

  // Fallback to cached tours
  try {
    console.log("[Tours] Trying to load from cache...");
    const cachedItems = await loadCachedTours();
    if (cachedItems.length > 0) {
      console.log(`[Tours] Got ${cachedItems.length} tours from cache`);
      return { items: cachedItems, error: null, source: "cache" };
    } else {
      console.log("[Tours] Cache is empty");
    }
  } catch (err) {
    console.warn("[Tours] Could not load cache:", err instanceof Error ? err.message : String(err));
  }

  // No data available
  console.log("[Tours] No data available from Supabase or cache");
  return { items: [], error: "No data available - check Supabase connection and credentials", source: "none" };
}
