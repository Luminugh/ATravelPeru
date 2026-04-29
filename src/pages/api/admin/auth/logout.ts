import type { APIRoute } from "astro";
import { ADMIN_ACCESS_COOKIE, ADMIN_ACTIVITY_COOKIE } from "@lib/admin-auth";

export const POST: APIRoute = async ({ cookies }) => {
  try {
    cookies.delete(ADMIN_ACCESS_COOKIE);
    cookies.delete(ADMIN_ACTIVITY_COOKIE);

    return new Response(
      JSON.stringify({
        ok: true,
        message: "Sesión cerrada correctamente",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error en logout:", error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Error interno del servidor",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
