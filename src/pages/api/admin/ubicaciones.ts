import type { APIRoute } from "astro";
import { GetUbicacionesUseCase } from "../../../application/use-cases/GetUbicacionesUseCase";
import { createSupabaseAuthedClient } from "../../../infrastructure/supabase/AdminAuthClientFactory";
import { ADMIN_ACCESS_COOKIE } from "../../../domain/services/SessionService";

export const prerender = false;

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "No autenticado" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return unauthorized();
  }

  try {
    const client = createSupabaseAuthedClient(accessToken);
    const getUbicacionesUseCase = new GetUbicacionesUseCase(client);
    const data = await getUbicacionesUseCase.execute();

    return new Response(JSON.stringify({ ok: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
