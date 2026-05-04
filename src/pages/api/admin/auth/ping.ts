import type { APIRoute } from "astro";
import { PingSessionUseCase } from "../../../../application/use-cases/PingSessionUseCase";
import { createSupabasePublicClient } from "../../../../infrastructure/supabase/AdminAuthClientFactory";
import { ADMIN_ACCESS_COOKIE, ADMIN_ACTIVITY_COOKIE, getCookieSecurityOptions } from "../../../../domain/services/SessionService";
import { UnauthorizedError } from "../../../../domain/errors/DomainError";

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;

  try {
    const client = createSupabasePublicClient();
    const pingSessionUseCase = new PingSessionUseCase(client);
    await pingSessionUseCase.execute(accessToken || "");

    const options = getCookieSecurityOptions();
    cookies.set(ADMIN_ACTIVITY_COOKIE, Date.now().toString(), {
      ...options,
      httpOnly: false,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      cookies.delete(ADMIN_ACCESS_COOKIE, { path: "/" });
      cookies.delete(ADMIN_ACTIVITY_COOKIE, { path: "/" });
    }
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Error interno del servidor",
      }),
      { status: error instanceof UnauthorizedError ? 401 : 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
