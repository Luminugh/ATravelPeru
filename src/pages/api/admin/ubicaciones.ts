import type { APIRoute } from "astro";
import { createSupabasePublicClient } from "../../../lib/admin-auth";

export const GET: APIRoute = async () => {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.from("ubicaciones").select("id,nombre").order("nombre");
  if (error) return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ ok: true, data }), { headers: { "Content-Type": "application/json" } });
};
