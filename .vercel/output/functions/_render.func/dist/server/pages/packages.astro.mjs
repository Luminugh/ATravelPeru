import { e as createComponent, h as createAstro } from '../chunks/astro/server_z5fA6ZdE.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Packages = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Packages;
  return Astro2.redirect("/", 301);
}, "C:/Users/admin/Documents/temp/ATRAVEL/src/pages/packages.astro", void 0);

const $$file = "C:/Users/admin/Documents/temp/ATRAVEL/src/pages/packages.astro";
const $$url = "/packages";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Packages,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
