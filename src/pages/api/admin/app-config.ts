import type { APIRoute } from "astro";
import { GetWhatsAppConfigUseCase } from "../../../application/use-cases/GetWhatsAppConfigUseCase";
import { UpdateWhatsAppConfigUseCase } from "../../../application/use-cases/UpdateWhatsAppConfigUseCase";
import { SupabaseAppConfigRepository } from "../../../infrastructure/repositories/SupabaseAppConfigRepository";
import { createSupabaseAuthedClient } from "../../../infrastructure/supabase/AdminAuthClientFactory";
import { ADMIN_ACCESS_COOKIE } from "../../../domain/services/SessionService";
import { ValidationError, UnauthorizedError } from "../../../domain/errors/DomainError";

export const prerender = false;

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function isAdmin(client: any, userId: string): Promise<boolean> {
  try {
    const { data, error } = await client
      .from('users')
      .select('role')
      .eq('id', userId)
      .eq('role', 'admin')
      .single();
    
    if (error || !data) return false;
    return true;
  } catch (err) {
    return false;
  }
}

// GET: Obtener número de WhatsApp global (público, sin auth)
export const GET: APIRoute = async () => {
  try {
    const appConfigRepository = new SupabaseAppConfigRepository();
    const getWhatsAppConfigUseCase = new GetWhatsAppConfigUseCase(appConfigRepository);
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

// POST: Actualizar número de WhatsApp (solo admin)
export const POST: APIRoute = async ({ cookies, request }) => {
  const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return jsonResponse({ ok: false, error: "No autorizado" }, 401);
  }

  try {
    const client = createSupabaseAuthedClient(accessToken);
    const { data: authData, error: authError } = await client.auth.getUser(accessToken);

    if (authError || !authData?.user?.id) {
      return jsonResponse({ ok: false, error: "Usuario no autenticado" }, 401);
    }

    const userId = authData.user.id;

    // Check admin status
    const admin = await isAdmin(client, userId);
    if (!admin) {
      return jsonResponse({ ok: false, error: "No autorizado: permisos de administrador requeridos" }, 403);
    }

    const body = await request.json();
    const { phone } = body;

    const updateWhatsAppConfigUseCase = new UpdateWhatsAppConfigUseCase(client);
    const result = await updateWhatsAppConfigUseCase.execute(userId, phone);

    return jsonResponse({
      ok: true,
      phone: result.phone,
    });
  } catch (error) {
    console.error("Error updating WhatsApp config:", error);
    
    const status = 
      error instanceof ValidationError ? 400 :
      error instanceof UnauthorizedError ? 403 :
      500;

    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Error al guardar configuración",
      },
      status
    );
  }
};
