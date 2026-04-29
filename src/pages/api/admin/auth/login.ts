import type { APIRoute } from "astro";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACTIVITY_COOKIE,
  createSupabasePublicClient,
  getCookieSecurityOptions,
} from "../../../../lib/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json().catch(() => ({}));

    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: "Email y contrasena son requeridos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const client = createSupabasePublicClient();
    const { data, error } = await client.auth.signInWithPassword({ email, password });

    if (error || !data?.session?.access_token) {
      return new Response(JSON.stringify({ ok: false, error: error?.message || "Credenciales invalidas" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const options = getCookieSecurityOptions();
    cookies.set(ADMIN_ACCESS_COOKIE, data.session.access_token, options);
    cookies.set(ADMIN_ACTIVITY_COOKIE, Date.now().toString(), {
      ...options,
      httpOnly: false,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        user: {
          email: data.user?.email ?? null,
          nombre: (data.user?.user_metadata?.nombre as string | undefined) ?? null,
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
