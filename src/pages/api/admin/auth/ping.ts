import type { APIRoute } from "astro";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACTIVITY_COOKIE,
  createSupabasePublicClient,
  getCookieSecurityOptions,
} from "../../../../lib/admin-auth";

export const POST: APIRoute = async ({ cookies }) => {
  const token = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: "No autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    const options = getCookieSecurityOptions();
    cookies.delete(ADMIN_ACCESS_COOKIE, options);
    cookies.delete(ADMIN_ACTIVITY_COOKIE, options);
    return new Response(JSON.stringify({ ok: false, error: "Sesion invalida" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  cookies.set(ADMIN_ACTIVITY_COOKIE, String(Date.now()), {
    ...getCookieSecurityOptions(),
    maxAge: 60 * 60 * 8,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
