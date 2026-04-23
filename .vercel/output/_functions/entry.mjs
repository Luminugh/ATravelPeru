import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_B3pB7Gen.mjs';
import { manifest } from './manifest_BrFoDmfw.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/auth/forgot-password.astro.mjs');
const _page2 = () => import('./pages/api/auth/login.astro.mjs');
const _page3 = () => import('./pages/api/auth/register.astro.mjs');
const _page4 = () => import('./pages/api/support.astro.mjs');
const _page5 = () => import('./pages/ayuda.astro.mjs');
const _page6 = () => import('./pages/hoteles.astro.mjs');
const _page7 = () => import('./pages/ofertas.astro.mjs');
const _page8 = () => import('./pages/packages.astro.mjs');
const _page9 = () => import('./pages/paquetes.astro.mjs');
const _page10 = () => import('./pages/tours-at.astro.mjs');
const _page11 = () => import('./pages/vuelos.astro.mjs');
const _page12 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/auth/forgot-password.ts", _page1],
    ["src/pages/api/auth/login.ts", _page2],
    ["src/pages/api/auth/register.ts", _page3],
    ["src/pages/api/support.ts", _page4],
    ["src/pages/ayuda.astro", _page5],
    ["src/pages/hoteles.astro", _page6],
    ["src/pages/ofertas.astro", _page7],
    ["src/pages/packages.astro", _page8],
    ["src/pages/paquetes.astro", _page9],
    ["src/pages/tours-at.astro", _page10],
    ["src/pages/vuelos.astro", _page11],
    ["src/pages/index.astro", _page12]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "175ba610-e822-4b03-b3ce-63c71e6c4d1c",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
