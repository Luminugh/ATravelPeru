export { renderers } from '../../../renderers.mjs';

const POST = async ({ request }) => {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
