import type { APIRoute } from "astro";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACTIVITY_COOKIE,
  createSupabasePublicClient,
  getCookieSecurityOptions,
} from "../../../../lib/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;

  if (!accessToken) {
    return new Response(JSON.stringify({ ok: false, error: "No autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const client = createSupabasePublicClient();
    const { error } = await client.auth.getUser(accessToken);

    if (error) {
      cookies.delete(ADMIN_ACCESS_COOKIE, { path: "/" });
      cookies.delete(ADMIN_ACTIVITY_COOKIE, { path: "/" });
      return new Response(JSON.stringify({ ok: false, error: "Sesion invalida" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

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
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : "Error interno del servidor",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
