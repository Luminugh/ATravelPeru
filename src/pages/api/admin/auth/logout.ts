import type { APIRoute } from "astro";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACTIVITY_COOKIE,
  createSupabasePublicClient,
  getCookieSecurityOptions,
} from "../../../../lib/admin-auth";

export const prerender = false;

export const POST: APIRoute = async ({ cookies }) => {
  const token = cookies.get(ADMIN_ACCESS_COOKIE)?.value;

  if (token) {
    try {
      const supabase = createSupabasePublicClient();
      await supabase.auth.signOut();
    } catch {
      // No-op: clear local cookies anyway.
    }
  }

  const options = getCookieSecurityOptions();
  cookies.delete(ADMIN_ACCESS_COOKIE, options);
  cookies.delete(ADMIN_ACTIVITY_COOKIE, options);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
