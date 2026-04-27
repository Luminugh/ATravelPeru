import { defineMiddleware } from "astro:middleware";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACTIVITY_COOKIE,
  createSupabasePublicClient,
  getCookieSecurityOptions,
  isIdleExpired,
} from "./lib/admin-auth";

const DISABLED_ADMIN_ROUTES = new Set([
  "/admin/vuelos",
  "/admin/hoteles",
  "/admin/paquetes",
  "/admin/ofertas",
]);

function redirectToLogin(url: URL) {
  const nextUrl = encodeURIComponent(url.pathname + url.search);
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/admin/login?next=${nextUrl}`,
    },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith("/admin")) {
    return next();
  }

  if (pathname === "/admin/login") {
    return next();
  }

  if (DISABLED_ADMIN_ROUTES.has(pathname)) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/admin?module=disabled",
      },
    });
  }

  const token = context.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  const lastActivity = context.cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;

  if (!token || isIdleExpired(lastActivity)) {
    const cookieOptions = getCookieSecurityOptions();
    context.cookies.delete(ADMIN_ACCESS_COOKIE, cookieOptions);
    context.cookies.delete(ADMIN_ACTIVITY_COOKIE, cookieOptions);
    return redirectToLogin(context.url);
  }

  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    const cookieOptions = getCookieSecurityOptions();
    context.cookies.delete(ADMIN_ACCESS_COOKIE, cookieOptions);
    context.cookies.delete(ADMIN_ACTIVITY_COOKIE, cookieOptions);
    return redirectToLogin(context.url);
  }

  return next();
});
