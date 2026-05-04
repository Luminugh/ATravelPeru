import type { APIRoute } from "astro";
import { GetWhatsAppConfigUseCase } from "../../application/use-cases/GetWhatsAppConfigUseCase";
import { SupabaseAppConfigRepository } from "../../infrastructure/repositories/SupabaseAppConfigRepository";

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
    // Instantiate dependencies
    const appConfigRepository = new SupabaseAppConfigRepository();
    const getWhatsAppConfigUseCase = new GetWhatsAppConfigUseCase(appConfigRepository);

    // Execute use case
    const result = await getWhatsAppConfigUseCase.execute();

    return jsonResponse({
      ok: true,
      phone: result.phone,
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
