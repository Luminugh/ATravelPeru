import type { APIRoute } from "astro";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACTIVITY_COOKIE,
  createSupabaseAuthedClient,
  createSupabasePublicClient,
  getCookieSecurityOptions,
} from "../../../../lib/admin-auth";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const email = String(body?.email ?? "").trim();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return new Response(JSON.stringify({ ok: false, error: "Correo y contrasena son obligatorios." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session || !data.user) {
      return new Response(JSON.stringify({ ok: false, error: "Credenciales invalidas." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const authed = createSupabaseAuthedClient(data.session.access_token);
    const { data: seller, error: sellerError } = await authed
      .from("vendedores")
      .select("id,nombre")
      .eq("id", data.user.id)
      .maybeSingle();

    // If seller row doesn't exist yet, create it automatically so auth users can access admin panel.
    if (sellerError) {
      await supabase.auth.signOut();
      const msg = sellerError.message ?? String(sellerError);
      return new Response(JSON.stringify({ ok: false, error: `Error al verificar permisos de vendedor: ${msg}` }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    let finalSeller = seller;
    if (!finalSeller) {
      const createRes = await authed.from("vendedores").insert({ id: data.user.id, nombre: data.user.email ?? 'Vendedor' }).select("id,nombre").maybeSingle();
      if (createRes.error || !createRes.data) {
        // If we cannot create the vendedor, sign out and deny access
        await supabase.auth.signOut();
        return new Response(JSON.stringify({ ok: false, error: "Tu usuario no tiene acceso al panel administrativo." }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      finalSeller = createRes.data;
    }

    const options = getCookieSecurityOptions();
    cookies.set(ADMIN_ACCESS_COOKIE, data.session.access_token, {
      ...options,
      maxAge: 60 * 60 * 8,
    });

    cookies.set(ADMIN_ACTIVITY_COOKIE, String(Date.now()), {
      ...options,
      maxAge: 60 * 60 * 8,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          nombre: finalSeller?.nombre ?? "Usuario Admin",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Error inesperado" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
