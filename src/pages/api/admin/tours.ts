import type { APIRoute } from "astro";
import { ADMIN_ACCESS_COOKIE, createSupabaseAuthedClient } from "../../../lib/admin-auth";

type GalleryInput = Array<{ imagen: string; orden?: number; alt_text?: string | null }>;

export const prerender = false;

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getAccessToken(cookies: Parameters<APIRoute>[0]["cookies"]) {
  return cookies.get(ADMIN_ACCESS_COOKIE)?.value;
}

function normalizeGallery(input: unknown): GalleryInput {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const row = item as { imagen?: unknown; orden?: unknown; alt_text?: unknown };
      if (typeof row.imagen !== "string" || !row.imagen.trim()) {
        return null;
      }
      const parsedOrder = Number(row.orden);
      return {
        imagen: row.imagen.trim(),
        orden: Number.isFinite(parsedOrder) ? parsedOrder : index + 1,
        alt_text: typeof row.alt_text === "string" ? row.alt_text : null,
      };
    })
    .filter((row): row is GalleryInput[number] => Boolean(row));
}

function mapTourForClient(row: Record<string, unknown>) {
  const ubicaciones = row.ubicaciones as { nombre?: string } | { nombre?: string }[] | null;
  const ubicacion = Array.isArray(ubicaciones) ? ubicaciones[0]?.nombre : ubicaciones?.nombre;
  const galleryRows = Array.isArray(row.tour_galeria) ? row.tour_galeria : [];

  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    precio: Number(row.precio ?? 0),
    duracion: row.duracion,
    ubicacion_id: row.ubicacion_id,
    ubicacion: ubicacion ?? "",
    incluye: row.incluye,
    no_incluye: row.no_incluye,
    itinerario: row.itinerario,
    imagen_principal: row.imagen_principal,
    destacado: Boolean(row.destacado),
    estado: row.estado,
    vendedor_id: row.vendedor_id,
    galeria: galleryRows
      .map((g) => {
        if (!g || typeof g !== "object") {
          return null;
        }
        const item = g as { imagen?: unknown; orden?: unknown; alt_text?: unknown };
        if (typeof item.imagen !== "string") {
          return null;
        }
        return {
          imagen: item.imagen,
          orden: Number(item.orden ?? 0),
          alt_text: typeof item.alt_text === "string" ? item.alt_text : null,
        };
      })
      .filter((g): g is { imagen: string; orden: number; alt_text: string | null } => Boolean(g))
      .sort((a, b) => a.orden - b.orden),
  };
}

async function getAuthenticatedClient(cookies: Parameters<APIRoute>[0]["cookies"]) {
  const accessToken = getAccessToken(cookies);
  if (!accessToken) {
    return { error: jsonResponse({ ok: false, error: "No autenticado" }, 401) } as const;
  }

  const client = createSupabaseAuthedClient(accessToken);
  const { data, error } = await client.auth.getUser(accessToken);

  if (error || !data?.user) {
    return { error: jsonResponse({ ok: false, error: "Sesion invalida" }, 401) } as const;
  }

  return {
    client,
    userId: data.user.id,
  } as const;
}

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) {
      return auth.error;
    }

    const { data, error } = await auth.client
      .from("tours")
      .select(
        "id,titulo,descripcion,precio,duracion,ubicacion_id,incluye,no_incluye,itinerario,imagen_principal,destacado,estado,vendedor_id,ubicaciones(nombre),tour_galeria(imagen,orden,alt_text)",
      )
      .order("id", { ascending: true });

    if (error) {
      return jsonResponse({ ok: false, error: error.message }, 400);
    }

    const items = (data ?? []).map((row) => mapTourForClient(row as Record<string, unknown>));
    return jsonResponse({ ok: true, data: items });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, 500);
  }
};

export const POST: APIRoute = async ({ cookies, request }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ ok: false, error: "Payload invalido" }, 400);
    }

    const payload = body as Record<string, unknown>;
    const insertPayload = {
      titulo: String(payload.titulo ?? "").trim(),
      descripcion: String(payload.descripcion ?? "").trim(),
      precio: Number(payload.precio ?? 0),
      duracion: String(payload.duracion ?? "").trim(),
      ubicacion_id: Number(payload.ubicacion_id),
      incluye: String(payload.incluye ?? "").trim(),
      no_incluye: payload.no_incluye ? String(payload.no_incluye) : null,
      itinerario: payload.itinerario ? String(payload.itinerario) : null,
      imagen_principal: payload.imagen_principal ? String(payload.imagen_principal) : null,
      destacado: Boolean(payload.destacado),
      estado: payload.estado === "inactivo" ? "inactivo" : "activo",
      vendedor_id: auth.userId,
    };

    const { data, error } = await auth.client.from("tours").insert(insertPayload).select("id").single();

    if (error || !data?.id) {
      return jsonResponse({ ok: false, error: error?.message ?? "No fue posible crear el tour" }, 400);
    }

    const gallery = normalizeGallery(payload.galeria);
    if (gallery.length > 0) {
      const rows = gallery.map((g) => ({
        tour_id: data.id,
        imagen: g.imagen,
        orden: g.orden ?? 0,
        alt_text: g.alt_text ?? null,
      }));
      const { error: galleryError } = await auth.client.from("tour_galeria").insert(rows);
      if (galleryError) {
        return jsonResponse({ ok: false, error: galleryError.message }, 400);
      }
    }

    return jsonResponse({ ok: true, data: { id: data.id } }, 201);
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, 500);
  }
};

export const PUT: APIRoute = async ({ cookies, request }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return jsonResponse({ ok: false, error: "Payload invalido" }, 400);
    }

    const payload = body as Record<string, unknown>;
    const id = Number(payload.id);
    if (!Number.isFinite(id) || id <= 0) {
      return jsonResponse({ ok: false, error: "ID invalido" }, 400);
    }

    const updatePayload = {
      titulo: String(payload.titulo ?? "").trim(),
      descripcion: String(payload.descripcion ?? "").trim(),
      precio: Number(payload.precio ?? 0),
      duracion: String(payload.duracion ?? "").trim(),
      ubicacion_id: Number(payload.ubicacion_id),
      incluye: String(payload.incluye ?? "").trim(),
      no_incluye: payload.no_incluye ? String(payload.no_incluye) : null,
      itinerario: payload.itinerario ? String(payload.itinerario) : null,
      imagen_principal: payload.imagen_principal ? String(payload.imagen_principal) : null,
      destacado: Boolean(payload.destacado),
      estado: payload.estado === "inactivo" ? "inactivo" : "activo",
    };

    const { error } = await auth.client.from("tours").update(updatePayload).eq("id", id);
    if (error) {
      return jsonResponse({ ok: false, error: error.message }, 400);
    }

    const { error: deleteGalleryError } = await auth.client.from("tour_galeria").delete().eq("tour_id", id);
    if (deleteGalleryError) {
      return jsonResponse({ ok: false, error: deleteGalleryError.message }, 400);
    }

    const gallery = normalizeGallery(payload.galeria);
    if (gallery.length > 0) {
      const rows = gallery.map((g) => ({
        tour_id: id,
        imagen: g.imagen,
        orden: g.orden ?? 0,
        alt_text: g.alt_text ?? null,
      }));
      const { error: galleryError } = await auth.client.from("tour_galeria").insert(rows);
      if (galleryError) {
        return jsonResponse({ ok: false, error: galleryError.message }, 400);
      }
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, 500);
  }
};

export const DELETE: APIRoute = async ({ cookies, request }) => {
  try {
    const auth = await getAuthenticatedClient(cookies);
    if ("error" in auth) {
      return auth.error;
    }

    const body = await request.json().catch(() => null);
    const id = Number((body as { id?: unknown } | null)?.id);
    if (!Number.isFinite(id) || id <= 0) {
      return jsonResponse({ ok: false, error: "ID invalido" }, 400);
    }

    const { error } = await auth.client.from("tours").delete().eq("id", id);
    if (error) {
      return jsonResponse({ ok: false, error: error.message }, 400);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, 500);
  }
};
