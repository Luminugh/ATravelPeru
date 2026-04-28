import { defineMiddleware } from "astro:middleware";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACTIVITY_COOKIE,
  getCookieSecurityOptions,
  isIdleExpired,
} from "./lib/admin-auth";

function redirectToLogin(url: URL) {
  const nextUrl = encodeURIComponent(url.pathname + url.search);
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/admin/login?next=${nextUrl}`,
    },
  });
}

export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  // Solo proteger rutas /admin (excepto login)
  if (!pathname.startsWith("/admin")) {
    return next();
  }

  if (pathname === "/admin/login") {
    return next();
  }

  // Validación básica de cookies (sin async)
  const token = context.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
  const lastActivity = context.cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;

  if (!token || isIdleExpired(lastActivity)) {
    const cookieOptions = getCookieSecurityOptions();
    context.cookies.delete(ADMIN_ACCESS_COOKIE, cookieOptions);
    context.cookies.delete(ADMIN_ACTIVITY_COOKIE, cookieOptions);
    return redirectToLogin(context.url);
  }

  return next();
});
