import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);

  if (!body?.email) {
    return new Response(
      JSON.stringify({ message: "El correo es obligatorio." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      message: "Hemos enviado un enlace de recuperacion a tu correo."
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
