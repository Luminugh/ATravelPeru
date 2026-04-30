import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../../lib/supabase";
import { ADMIN_ACCESS_COOKIE, createSupabaseAuthedClient } from "../../../lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

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

function cleanPhoneNumber(phone: string): string {
  return (phone ?? "").replace(/\D/g, "");
}

// GET: Obtener número de WhatsApp global (público, sin auth)
export const GET: APIRoute = async () => {
  try {
    const supabase = getSupabaseServerClient();

    if (!supabase) {
      return jsonResponse({ ok: false, error: "Supabase not configured", phone: null }, 500);
    }

    const { data, error } = await supabase
      .from("app_config")
      .select("config_value")
      .eq("config_key", "whatsapp_phone")
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    const phone = data?.config_value || null;

    return jsonResponse({
      ok: true,
      phone: phone,
    });
  } catch (error) {
    console.error("Error fetching WhatsApp config:", error);
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error al cargar configuración",
        phone: null,
      },
      500
    );
  }
};

// POST: Actualizar número de WhatsApp (solo admin)
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

    // Verify the user is a registered vendedor (admin/seller) before allowing changes
    const sellerCheck = await client.from("vendedores").select("id").eq("id", auth.data.user.id).maybeSingle();
    if (!sellerCheck.data) {
      return jsonResponse({ ok: false, error: "El usuario no tiene permisos de vendedor/admin" }, 403);
    }

    const body = await request.json();
    const { phone } = body;

    // Validación
    if (typeof phone !== "string" || phone.trim().length === 0) {
      return jsonResponse(
        { ok: false, error: "El número de teléfono es requerido" },
        400
      );
    }

    const cleanedPhone = cleanPhoneNumber(phone);
    if (cleanedPhone.length < 9) {
      return jsonResponse(
        { ok: false, error: "El número debe tener al menos 9 dígitos" },
        400
      );
    }

    // Actualizar o insertar configuración.
    // Use service role key when available to avoid RLS/header caching issues on PostgREST,
    // but only after verifying the caller is an authorized vendedor/admin.
    const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE as string | undefined;
    let upsertError = null;
    if (serviceRoleKey) {
      const url = import.meta.env.PUBLIC_SUPABASE_URL;
      const svc = createClient(url as string, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await svc.from("app_config").upsert(
        {
          config_key: "whatsapp_phone",
          config_value: cleanedPhone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "config_key" }
      );
      upsertError = error;
    } else {
      // Fallback: call the PostgREST endpoint directly including both Authorization (user JWT)
      // and apikey (anon key) headers so RLS sees auth.uid() and the request is accepted.
      const url = import.meta.env.PUBLIC_SUPABASE_URL as string;
      const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string | undefined;
      try {
        const restUrl = `${url.replace(/\/$/, "")}/rest/v1/app_config?on_conflict=config_key`;
        const res = await fetch(restUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(anonKey ? { apikey: anonKey } : {}),
            Prefer: "resolution=merge-duplicates,return=representation",
          },
          body: JSON.stringify([
            {
              config_key: "whatsapp_phone",
              config_value: cleanedPhone,
              updated_at: new Date().toISOString(),
            },
          ]),
        });

        if (!res.ok) {
          const text = await res.text();
          upsertError = new Error(`REST upsert failed: ${res.status} ${text}`);
        } else {
          upsertError = null;
        }
      } catch (err) {
        upsertError = err as Error;
      }
    }

    if (upsertError) {
      throw upsertError;
    }

    return jsonResponse({
      ok: true,
      phone: cleanedPhone,
    });
  } catch (error) {
    console.error("Error updating WhatsApp config:", error);
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error al guardar configuración",
      },
      500
    );
  }
};
