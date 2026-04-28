import type { APIRoute } from "astro";
import {
  ADMIN_ACCESS_COOKIE,
  createSupabaseAuthedClient,
  createSupabasePublicClient,
} from "../../../lib/admin-auth";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), { status: 401 });
  }

  const authed = createSupabaseAuthedClient(token);
  const { data, error } = await authed.from("v_tours_catalogo").select("*").order("created_at", { ascending: false });
  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }
  return new Response(JSON.stringify({ ok: true, data }), { headers: { "Content-Type": "application/json" } });
};

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!token) return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), { status: 401 });

  const body = await request.json();
  const authed = createSupabaseAuthedClient(token);
  const userResp = await authed.auth.getUser();
  const userId = userResp.data.user?.id;
  if (!userId) return new Response(JSON.stringify({ ok: false, error: "User not found" }), { status: 401 });

  const insertPayload = {
    titulo: body.titulo,
    descripcion: body.descripcion,
    precio: body.precio,
    duracion: body.duracion,
    ubicacion_id: body.ubicacion_id,
    incluye: body.incluye,
    no_incluye: body.no_incluye ?? null,
    itinerario: body.itinerario ?? null,
    imagen_principal: body.imagen_principal,
    destacado: Boolean(body.destacado),
    estado: body.estado ?? "activo",
    vendedor_id: userId,
  };

  const { data, error } = await authed.from("tours").insert(insertPayload).select("id").maybeSingle();
  if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });

  // If gallery JSON provided, insert into tour_galeria
  if (body.galeria && Array.isArray(body.galeria) && data?.id) {
    const galleryRows = body.galeria.map((g: any, idx: number) => ({ tour_id: data.id, imagen: g.imagen, orden: g.orden ?? idx + 1, alt_text: g.alt_text ?? null }));
    await authed.from("tour_galeria").insert(galleryRows);
  }

  return new Response(JSON.stringify({ ok: true, id: data.id }), { headers: { "Content-Type": "application/json" } });
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!token) return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), { status: 401 });

  const body = await request.json();
  const id = body.id;
  if (!id) return new Response(JSON.stringify({ ok: false, error: "Missing id" }), { status: 400 });

  const authed = createSupabaseAuthedClient(token);
  const updatePayload: any = {
    titulo: body.titulo,
    descripcion: body.descripcion,
    precio: body.precio,
    duracion: body.duracion,
    ubicacion_id: body.ubicacion_id,
    incluye: body.incluye,
    no_incluye: body.no_incluye ?? null,
    itinerario: body.itinerario ?? null,
    imagen_principal: body.imagen_principal,
    destacado: Boolean(body.destacado),
    estado: body.estado ?? "activo",
  };

  const { data, error } = await authed.from("tours").update(updatePayload).eq("id", id).select("id").maybeSingle();
  if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });

  // Replace gallery if provided (simple approach: delete existing then insert)
  if (body.galeria && Array.isArray(body.galeria)) {
    await authed.from("tour_galeria").delete().eq("tour_id", id);
    const galleryRows = body.galeria.map((g: any, idx: number) => ({ tour_id: id, imagen: g.imagen, orden: g.orden ?? idx + 1, alt_text: g.alt_text ?? null }));
    if (galleryRows.length) await authed.from("tour_galeria").insert(galleryRows);
  }

  return new Response(JSON.stringify({ ok: true, id: data?.id ?? id }), { headers: { "Content-Type": "application/json" } });
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!token) return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), { status: 401 });

  const body = await request.json();
  const id = body.id;
  if (!id) return new Response(JSON.stringify({ ok: false, error: "Missing id" }), { status: 400 });

  const authed = createSupabaseAuthedClient(token);
  const { error } = await authed.from("tours").delete().eq("id", id);
  if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
};
// Referencial API admin: tours
// Pendiente de implementacion de endpoints.
