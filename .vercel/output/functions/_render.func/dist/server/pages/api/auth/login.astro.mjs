export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
