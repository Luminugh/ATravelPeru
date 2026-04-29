import type { APIRoute } from "astro";
import { ADMIN_ACCESS_COOKIE, createSupabaseAuthedClient, isIdleExpired, ADMIN_ACTIVITY_COOKIE } from "../../../lib/admin-auth";

export const prerender = false;

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
    const lastActivity = cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;

    if (!accessToken || isIdleExpired(lastActivity)) {
      cookies.delete(ADMIN_ACCESS_COOKIE, { path: "/" });
      cookies.delete(ADMIN_ACTIVITY_COOKIE, { path: "/" });
      return json({ ok: false, error: "No autenticado" }, 401);
    }

    const client = createSupabaseAuthedClient(accessToken);
    const { data: userData, error: userError } = await client.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return json({ ok: false, error: "Sesion invalida" }, 401);
    }

    const userId = userData.user.id;

    const [sellerRes, toursRes] = await Promise.all([
      client.from("vendedores").select("id,nombre,telefono,created_at").eq("id", userId).maybeSingle(),
      client.from("tours").select("id", { count: "exact", head: true }).eq("vendedor_id", userId),
    ]);

    if (sellerRes.error) {
      return json({ ok: false, error: sellerRes.error.message }, 400);
    }

    return json({
      ok: true,
      data: {
        user: {
          id: userData.user.id,
          email: userData.user.email ?? null,
          nombre: (userData.user.user_metadata?.nombre as string | undefined) ?? null,
          created_at: userData.user.created_at,
        },
        vendedor: sellerRes.data ?? {
          id: userData.user.id,
          nombre: (userData.user.user_metadata?.nombre as string | undefined) ?? null,
          telefono: null,
          created_at: null,
        },
        metrics: {
          tours: toursRes.count ?? 0,
        },
      },
    });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, 500);
  }
};

export const PUT: APIRoute = async ({ cookies, request }) => {
  try {
    const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
    const lastActivity = cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;

    if (!accessToken || isIdleExpired(lastActivity)) {
      cookies.delete(ADMIN_ACCESS_COOKIE, { path: "/" });
      cookies.delete(ADMIN_ACTIVITY_COOKIE, { path: "/" });
      return json({ ok: false, error: "No autenticado" }, 401);
    }

    const client = createSupabaseAuthedClient(accessToken);
    const { data: userData, error: userError } = await client.auth.getUser(accessToken);
    if (userError || !userData?.user) {
      return json({ ok: false, error: "Sesion invalida" }, 401);
    }

    const body = await request.json().catch(() => null);
    const nombre = String(body?.nombre ?? "").trim();
    const telefonoRaw = String(body?.telefono ?? "").trim();
    const telefono = telefonoRaw.length > 0 ? telefonoRaw : null;

    if (!nombre) {
      return json({ ok: false, error: "El nombre es requerido" }, 400);
    }

    const userId = userData.user.id;

    const existingVendor = await client.from("vendedores").select("id").eq("id", userId).maybeSingle();
    if (existingVendor.error) {
      return json({ ok: false, error: existingVendor.error.message }, 400);
    }

    if (existingVendor.data) {
      const vendorUpdateRes = await client.from("vendedores").update({ nombre, telefono }).eq("id", userId);
      if (vendorUpdateRes.error) {
        return json({ ok: false, error: vendorUpdateRes.error.message }, 400);
      }
    } else {
      const vendorInsertRes = await client.from("vendedores").insert({ id: userId, nombre, telefono });
      if (vendorInsertRes.error) {
        return json({ ok: false, error: vendorInsertRes.error.message }, 400);
      }
    }

    return json({
      ok: true,
      data: {
        nombre,
        telefono,
      },
    });
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }, 500);
  }
};
