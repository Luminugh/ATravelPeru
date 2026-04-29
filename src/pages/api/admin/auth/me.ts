import type { APIRoute } from "astro";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACTIVITY_COOKIE,
  createSupabasePublicClient,
  getCookieSecurityOptions,
  isIdleExpired,
} from "../../../../lib/admin-auth";

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

    if (!accessToken) {
      return unauthorized(cookies);
    }

    if (isIdleExpired(lastActivity)) {
      return unauthorized(cookies, "Sesion expirada por inactividad");
    }

    const client = createSupabasePublicClient();
    const { data, error } = await client.auth.getUser(accessToken);

    if (error || !data?.user) {
      return unauthorized(cookies);
    }

    const options = getCookieSecurityOptions();
    cookies.set(ADMIN_ACTIVITY_COOKIE, Date.now().toString(), {
      ...options,
      httpOnly: false,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        user: {
          id: data.user.id,
          email: data.user.email ?? null,
          nombre: (data.user.user_metadata?.nombre as string | undefined) ?? null,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
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
