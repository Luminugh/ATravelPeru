import type { APIRoute } from "astro";
import { LoginUseCase } from "../../../../application/use-cases/LoginUseCase";
import { createSupabasePublicClient } from "../../../../infrastructure/supabase/AdminAuthClientFactory";
import { ADMIN_ACCESS_COOKIE, ADMIN_ACTIVITY_COOKIE, getCookieSecurityOptions } from "../../../../domain/services/SessionService";
import { UnauthorizedError } from "../../../../domain/errors/DomainError";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json().catch(() => ({}));

    const supabaseClient = createSupabasePublicClient();
    const loginUseCase = new LoginUseCase(supabaseClient);
    const user = await loginUseCase.execute(email, password);

    const options = getCookieSecurityOptions();
    cookies.set(ADMIN_ACCESS_COOKIE, user.accessToken || "", options);
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
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const status = error instanceof UnauthorizedError ? 401 : 500;
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Error interno del servidor",
      }),
      { status, headers: { "Content-Type": "application/json" } },
    );
  }
};
