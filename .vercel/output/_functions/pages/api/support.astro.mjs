export { renderers } from '../../renderers.mjs';

const POST = async ({ request }) => {
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

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
