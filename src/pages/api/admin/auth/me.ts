import type { APIRoute } from "astro";
import { GetCurrentUserUseCase } from "../../../../application/use-cases/GetCurrentUserUseCase";
import { createSupabaseAuthedClient } from "../../../../infrastructure/supabase/AdminAuthClientFactory";
import { ADMIN_ACCESS_COOKIE, ADMIN_ACTIVITY_COOKIE, getCookieSecurityOptions } from "../../../../domain/services/SessionService";
import { UnauthorizedError } from "../../../../domain/errors/DomainError";

export const prerender = false;

function unauthorized(cookies: Parameters<APIRoute>[0]["cookies"], message = "No autenticado") {
  cookies.delete(ADMIN_ACCESS_COOKIE, { path: "/" });
  cookies.delete(ADMIN_ACTIVITY_COOKIE, { path: "/" });
  return new Response(JSON.stringify({ ok: false, error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
    const lastActivity = cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;

    const client = createSupabaseAuthedClient(accessToken || "");
    const getCurrentUserUseCase = new GetCurrentUserUseCase(client);
    const user = await getCurrentUserUseCase.execute(accessToken, lastActivity);

    const options = getCookieSecurityOptions();
    cookies.set(ADMIN_ACTIVITY_COOKIE, Date.now().toString(), {
      ...options,
      httpOnly: false,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        user: {
          email: user.email,
          nombre: user.nombre,
          telefono: user.telefono,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return unauthorized(cookies, error.message);
    }
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Error interno del servidor",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
