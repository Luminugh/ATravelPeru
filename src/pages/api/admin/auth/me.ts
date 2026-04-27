import type { APIRoute } from "astro";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACTIVITY_COOKIE,
  createSupabaseAuthedClient,
  createSupabasePublicClient,
  getCookieSecurityOptions,
  isIdleExpired,
} from "../../../../lib/admin-auth";

export const GET: APIRoute = async ({ cookies }) => {
  const token = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  const lastActivity = cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;

  if (!token || isIdleExpired(lastActivity)) {
    const options = getCookieSecurityOptions();
    cookies.delete(ADMIN_ACCESS_COOKIE, options);
    cookies.delete(ADMIN_ACTIVITY_COOKIE, options);
    return new Response(JSON.stringify({ ok: false, error: "No autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createSupabasePublicClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    const options = getCookieSecurityOptions();
    cookies.delete(ADMIN_ACCESS_COOKIE, options);
    cookies.delete(ADMIN_ACTIVITY_COOKIE, options);
    return new Response(JSON.stringify({ ok: false, error: "Sesion invalida" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const authed = createSupabaseAuthedClient(token);
  const { data: seller } = await authed.from("vendedores").select("id,nombre").eq("id", userData.user.id).maybeSingle();

  return new Response(
    JSON.stringify({
      ok: true,
      user: {
        id: userData.user.id,
        email: userData.user.email,
        nombre: seller?.nombre ?? "Usuario Admin",
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
