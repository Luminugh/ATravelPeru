export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
