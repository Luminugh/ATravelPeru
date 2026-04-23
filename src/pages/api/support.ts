import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);

  if (!body?.name || !body?.email || !body?.subject || !body?.message) {
    return new Response(
      JSON.stringify({ message: "Completa todos los campos obligatorios del formulario." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ message: "Mensaje recibido. Nuestro equipo te contactara pronto." }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
