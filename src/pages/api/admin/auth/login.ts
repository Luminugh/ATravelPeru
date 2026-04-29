import type { APIRoute } from "astro";
import { createSupabasePublicClient, ADMIN_ACCESS_COOKIE, getCookieSecurityOptions } from "@lib/admin-auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email, password } = await request.json().catch(() => ({}));

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Email y contraseña son requeridos",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const client = createSupabasePublicClient();

    // Intentar autenticar con Supabase
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.session?.access_token) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: error?.message || "Credenciales inválidas",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Guardar token en cookie
    const options = getCookieSecurityOptions();
    cookies.set(ADMIN_ACCESS_COOKIE, data.session.access_token, options);

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Sesión iniciada correctamente",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en login:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Error interno del servidor",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
