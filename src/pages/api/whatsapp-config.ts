import type { APIRoute } from "astro";
import { getSupabaseServerClient } from "../../lib/supabase";

export const prerender = false;

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// GET: Obtener número de WhatsApp global (públicamente accesible)
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
