import type { APIRoute } from "astro";
import { ADMIN_ACCESS_COOKIE, isIdleExpired, ADMIN_ACTIVITY_COOKIE } from "@lib/admin-auth";

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const accessToken = cookies.get(ADMIN_ACCESS_COOKIE)?.value;
    const lastActivity = cookies.get(ADMIN_ACTIVITY_COOKIE)?.value;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ authenticated: false, error: "No token found" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verificar inactividad
    if (isIdleExpired(lastActivity)) {
      cookies.delete(ADMIN_ACCESS_COOKIE);
      cookies.delete(ADMIN_ACTIVITY_COOKIE);
      return new Response(
        JSON.stringify({ authenticated: false, error: "Session expired" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Actualizar actividad
    cookies.set(
      ADMIN_ACTIVITY_COOKIE,
      Date.now().toString(),
      {
        httpOnly: false,
        sameSite: "lax",
        secure: import.meta.env.PROD,
        path: "/",
      }
    );

    return new Response(
      JSON.stringify({ authenticated: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking auth:", error);
    return new Response(
      JSON.stringify({ authenticated: false, error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
