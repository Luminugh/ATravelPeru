import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json().catch(() => null);

  if (!body?.firstName || !body?.lastName || !body?.email || !body?.password || !body?.confirmPassword) {
    return new Response(
      JSON.stringify({ message: "Completa todos los campos requeridos." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  if (body.password !== body.confirmPassword) {
    return new Response(
      JSON.stringify({ message: "Las contrasenas no coinciden." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      message: "Cuenta creada correctamente. Ya puedes iniciar sesion.",
      user: { fullName: `${body.firstName} ${body.lastName}`, email: body.email }
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
};
