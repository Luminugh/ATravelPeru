import type { APIRoute } from "astro";
import { ADMIN_ACCESS_COOKIE, createSupabaseAuthedClient } from "../../../lib/admin-auth";

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

export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = getAccessToken(cookies);
  if (!accessToken) {
    return jsonResponse({ ok: false, error: "No autorizado" }, 401);
  }

  try {
    const client = createSupabaseAuthedClient(accessToken);
    const auth = await client.auth.getUser();

    if (!auth.data?.user?.id) {
      return jsonResponse({ ok: false, error: "Usuario no autenticado" }, 401);
    }

    const userId = auth.data.user.id;

    // Get current vendor's WhatsApp config
    const vendorRes = await client
      .from("vendedores")
      .select("whatsapp_message, whatsapp_phone")
      .eq("id", userId)
      .maybeSingle();

    if (vendorRes.error && vendorRes.error.code !== "PGRST116") {
      throw vendorRes.error;
    }

    // Get all vendors (for phone number selection)
    const allVendorsRes = await client
      .from("vendedores")
      .select("id, nombre, telefono")
      .not("telefono", "is", null)
      .order("nombre");

    if (allVendorsRes.error) {
      throw allVendorsRes.error;
    }

    const vendors = (allVendorsRes.data || []).map((v) => ({
      id: v.id,
      name: v.nombre || "Sin nombre",
      phone: v.telefono,
    }));

    return jsonResponse({
      ok: true,
      data: {
        message: vendorRes.data?.whatsapp_message || "",
        phone: vendorRes.data?.whatsapp_phone || "",
        vendors,
      },
    });
  } catch (error) {
    console.error("Error fetching WhatsApp config:", error);
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error al cargar configuración",
      },
      500
    );
  }
};

export const POST: APIRoute = async ({ cookies, request }) => {
  const accessToken = getAccessToken(cookies);
  if (!accessToken) {
    return jsonResponse({ ok: false, error: "No autorizado" }, 401);
  }

  try {
    const client = createSupabaseAuthedClient(accessToken);
    const auth = await client.auth.getUser();

    if (!auth.data?.user?.id) {
      return jsonResponse({ ok: false, error: "Usuario no autenticado" }, 401);
    }

    const userId = auth.data.user.id;
    const body = await request.json();
    const { message, phone } = body;

    // Validate inputs
    if (typeof message === "string" && message.trim().length === 0) {
      return jsonResponse(
        { ok: false, error: "El mensaje no puede estar vacío" },
        400
      );
    }

    if (typeof message === "string" && message.trim().length > 500) {
      return jsonResponse(
        { ok: false, error: "El mensaje no puede exceder 500 caracteres" },
        400
      );
    }

    if (typeof phone === "string" && phone.trim().length === 0) {
      return jsonResponse(
        { ok: false, error: "El número de teléfono no puede estar vacío" },
        400
      );
    }

    // Prepare update data
    const updateData: Record<string, string> = {};
    if (typeof message === "string") {
      updateData.whatsapp_message = message.trim();
    }
    if (typeof phone === "string") {
      updateData.whatsapp_phone = phone.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return jsonResponse(
        { ok: false, error: "No hay datos para actualizar" },
        400
      );
    }

    // Update vendor config
    const updateRes = await client
      .from("vendedores")
      .update(updateData)
      .eq("id", userId);

    if (updateRes.error) {
      throw updateRes.error;
    }

    return jsonResponse({
      ok: true,
      data: {
        message: updateData.whatsapp_message || message,
        phone: updateData.whatsapp_phone || phone,
      },
    });
  } catch (error) {
    console.error("Error saving WhatsApp config:", error);
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error al guardar configuración",
      },
      500
    );
  }
};
