import { defineMiddleware } from "astro:middleware";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_ACTIVITY_COOKIE,
  createSupabasePublicClient,
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

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith("/admin")) {
    return next();
  }

  if (pathname === "/admin/login") {
    return next();
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
