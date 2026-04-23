import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return new Response(
      JSON.stringify({ message: "Correo y contrasena son obligatorios." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      message: "Inicio de sesion exitoso. Bienvenido a ATRAVEL.",
      user: { email: body.email }
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
