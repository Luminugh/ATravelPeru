import type { APIRoute } from "astro";
import { ADMIN_ACCESS_COOKIE, createSupabaseAuthedClient } from "../../../lib/admin-auth";

export const prerender = false;

function unauthorized() {
  return new Response(JSON.stringify({ ok: false, error: "No autenticado" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async ({ cookies }) => {
  const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return unauthorized();
  }

  try {
    const client = createSupabaseAuthedClient(accessToken);
    const { data, error } = await client.from("ubicaciones").select("id,nombre").order("nombre", { ascending: true });

    if (error) {
      return new Response(JSON.stringify({ ok: false, error: error.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, data: data ?? [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "Error interno del servidor" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
