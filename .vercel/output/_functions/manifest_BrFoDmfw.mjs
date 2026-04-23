import 'piccolore';
import { p as decodeKey } from './chunks/astro/server_z5fA6ZdE.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_wW6yi_Oq.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/admin/Documents/temp/ATRAVEL/","cacheDir":"file:///C:/Users/admin/Documents/temp/ATRAVEL/node_modules/.astro/","outDir":"file:///C:/Users/admin/Documents/temp/ATRAVEL/dist/","srcDir":"file:///C:/Users/admin/Documents/temp/ATRAVEL/src/","publicDir":"file:///C:/Users/admin/Documents/temp/ATRAVEL/public/","buildClientDir":"file:///C:/Users/admin/Documents/temp/ATRAVEL/dist/client/","buildServerDir":"file:///C:/Users/admin/Documents/temp/ATRAVEL/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/auth/forgot-password","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/forgot-password\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"forgot-password","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/forgot-password.ts","pathname":"/api/auth/forgot-password","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/auth/login","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/login\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/login.ts","pathname":"/api/auth/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/auth/register","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/auth\\/register\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"auth","dynamic":false,"spread":false}],[{"content":"register","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/auth/register.ts","pathname":"/api/auth/register","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/support","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/support\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"support","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/support.ts","pathname":"/api/support","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/ayuda.CKRzGuqo.css"}],"routeData":{"route":"/ayuda","isIndex":false,"type":"page","pattern":"^\\/ayuda\\/?$","segments":[[{"content":"ayuda","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/ayuda.astro","pathname":"/ayuda","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/ayuda.CKRzGuqo.css"}],"routeData":{"route":"/hoteles","isIndex":false,"type":"page","pattern":"^\\/hoteles\\/?$","segments":[[{"content":"hoteles","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/hoteles.astro","pathname":"/hoteles","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/ayuda.CKRzGuqo.css"}],"routeData":{"route":"/ofertas","isIndex":false,"type":"page","pattern":"^\\/ofertas\\/?$","segments":[[{"content":"ofertas","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/ofertas.astro","pathname":"/ofertas","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/packages","isIndex":false,"type":"page","pattern":"^\\/packages\\/?$","segments":[[{"content":"packages","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/packages.astro","pathname":"/packages","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/ayuda.CKRzGuqo.css"}],"routeData":{"route":"/paquetes","isIndex":false,"type":"page","pattern":"^\\/paquetes\\/?$","segments":[[{"content":"paquetes","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/paquetes.astro","pathname":"/paquetes","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/ayuda.CKRzGuqo.css"}],"routeData":{"route":"/tours-at","isIndex":false,"type":"page","pattern":"^\\/tours-at\\/?$","segments":[[{"content":"tours-at","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/tours-at.astro","pathname":"/tours-at","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/ayuda.CKRzGuqo.css"}],"routeData":{"route":"/vuelos","isIndex":false,"type":"page","pattern":"^\\/vuelos\\/?$","segments":[[{"content":"vuelos","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/vuelos.astro","pathname":"/vuelos","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/ayuda.CKRzGuqo.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/admin/Documents/temp/ATRAVEL/src/pages/ayuda.astro",{"propagation":"none","containsHead":true}],["C:/Users/admin/Documents/temp/ATRAVEL/src/pages/hoteles.astro",{"propagation":"none","containsHead":true}],["C:/Users/admin/Documents/temp/ATRAVEL/src/pages/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/admin/Documents/temp/ATRAVEL/src/pages/ofertas.astro",{"propagation":"none","containsHead":true}],["C:/Users/admin/Documents/temp/ATRAVEL/src/pages/paquetes.astro",{"propagation":"none","containsHead":true}],["C:/Users/admin/Documents/temp/ATRAVEL/src/pages/tours-at.astro",{"propagation":"none","containsHead":true}],["C:/Users/admin/Documents/temp/ATRAVEL/src/pages/vuelos.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/auth/forgot-password@_@ts":"pages/api/auth/forgot-password.astro.mjs","\u0000@astro-page:src/pages/api/auth/login@_@ts":"pages/api/auth/login.astro.mjs","\u0000@astro-page:src/pages/api/auth/register@_@ts":"pages/api/auth/register.astro.mjs","\u0000@astro-page:src/pages/api/support@_@ts":"pages/api/support.astro.mjs","\u0000@astro-page:src/pages/ayuda@_@astro":"pages/ayuda.astro.mjs","\u0000@astro-page:src/pages/hoteles@_@astro":"pages/hoteles.astro.mjs","\u0000@astro-page:src/pages/ofertas@_@astro":"pages/ofertas.astro.mjs","\u0000@astro-page:src/pages/packages@_@astro":"pages/packages.astro.mjs","\u0000@astro-page:src/pages/paquetes@_@astro":"pages/paquetes.astro.mjs","\u0000@astro-page:src/pages/tours-at@_@astro":"pages/tours-at.astro.mjs","\u0000@astro-page:src/pages/vuelos@_@astro":"pages/vuelos.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BrFoDmfw.mjs","C:/Users/admin/Documents/temp/ATRAVEL/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_5mHBXxLu.mjs","C:/Users/admin/Documents/temp/ATRAVEL/src/layouts/AppLayout.astro?astro&type=script&index=0&lang.ts":"_astro/AppLayout.astro_astro_type_script_index_0_lang.CxO_JRN6.js","C:/Users/admin/Documents/temp/ATRAVEL/src/pages/ayuda.astro?astro&type=script&index=0&lang.ts":"_astro/ayuda.astro_astro_type_script_index_0_lang.Du6luP6m.js","C:/Users/admin/Documents/temp/ATRAVEL/src/components/Scripts.astro?astro&type=script&index=0&lang.ts":"_astro/Scripts.astro_astro_type_script_index_0_lang.DVSsmn8s.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["C:/Users/admin/Documents/temp/ATRAVEL/src/pages/ayuda.astro?astro&type=script&index=0&lang.ts","document.getElementById(\"faqSearch\").addEventListener(\"input\",function(t){const e=t.target.value.toLowerCase();document.querySelectorAll(\"details\").forEach(n=>{const r=n.textContent.toLowerCase();n.style.display=r.includes(e)?\"block\":\"none\"})});function s(){document.getElementById(\"supportModal\").style.display=\"none\"}document.getElementById(\"supportModal\").addEventListener(\"click\",function(t){t.target===this&&s()});async function a(t){const e=await fetch(\"/api/support\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify(t)}),o=await e.json();if(!e.ok)throw new Error(o.message||\"No se pudo enviar el mensaje.\");return o}document.getElementById(\"supportForm\").addEventListener(\"submit\",async function(t){t.preventDefault();try{const e=Object.fromEntries(new FormData(this).entries()),o=await a(e);showNotification(o.message,\"success\"),s(),this.reset()}catch(e){showNotification(e.message,\"error\")}});"],["C:/Users/admin/Documents/temp/ATRAVEL/src/components/Scripts.astro?astro&type=script&index=0&lang.ts","function c(){document.getElementById(\"loginModal\").style.display=\"flex\",a()}function s(){document.getElementById(\"loginModal\").style.display=\"none\"}function g(){document.getElementById(\"registerModal\").style.display=\"flex\",s()}function a(){document.getElementById(\"registerModal\").style.display=\"none\"}function r(){document.getElementById(\"forgotPasswordModal\").style.display=\"none\"}function u(e){e.preventDefault(),s(),document.getElementById(\"forgotPasswordModal\").style.display=\"flex\"}function m(e){e.preventDefault(),a(),r(),c()}function f(e){e.preventDefault(),s(),r(),g()}function w(e){const o=document.getElementById(e),t=document.getElementById(e+\"-icon\");o.type===\"password\"?(o.type=\"text\",t.className=\"fas fa-eye-slash\"):(o.type=\"password\",t.className=\"fas fa-eye\")}function n(e,o=\"info\"){const t=document.getElementById(\"notification\"),i=document.getElementById(\"notificationText\");i.textContent=e,t.dataset.type=o,t.classList.add(\"show\"),t.timeoutId&&clearTimeout(t.timeoutId),t.timeoutId=setTimeout(()=>{t.classList.remove(\"show\")},4e3)}function y(){const e=document.getElementById(\"notification\");e.classList.remove(\"show\"),e.timeoutId&&clearTimeout(e.timeoutId)}function p(){n(\"Redirigiendo a Google...\")}function h(){n(\"Redirigiendo a Google...\")}function M(){n(\"Por favor inicia sesion para acceder al carrito\",\"warning\"),setTimeout(()=>{c()},1e3)}function d(e,o){const t=document.getElementById(e);t&&t.addEventListener(\"click\",function(i){i.target===this&&o()})}d(\"loginModal\",s);d(\"registerModal\",a);d(\"forgotPasswordModal\",r);function E(){const e=document.getElementById(\"mobile-menu\");e&&(e.style.display=e.style.display===\"block\"?\"none\":\"block\")}document.addEventListener(\"click\",function(e){const o=document.getElementById(\"mobile-menu\"),t=document.querySelector(\".hamburger-menu\");!o||!t||!o.contains(e.target)&&!t.contains(e.target)&&(o.style.display=\"none\")});async function l(e,o){const t=await fetch(e,{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify(o)}),i=await t.json();if(!t.ok)throw new Error(i.message||\"Operacion no completada\");return i}document.getElementById(\"loginForm\")?.addEventListener(\"submit\",async function(e){e.preventDefault();const o=Object.fromEntries(new FormData(this).entries());try{const t=await l(\"/api/auth/login\",o);n(t.message,\"success\"),s(),this.reset()}catch(t){n(t.message,\"error\")}});document.getElementById(\"registerForm\")?.addEventListener(\"submit\",async function(e){e.preventDefault();const o=Object.fromEntries(new FormData(this).entries());try{const t=await l(\"/api/auth/register\",o);n(t.message,\"success\"),a(),this.reset()}catch(t){n(t.message,\"error\")}});document.getElementById(\"forgotPasswordForm\")?.addEventListener(\"submit\",async function(e){e.preventDefault();const o=Object.fromEntries(new FormData(this).entries());try{const t=await l(\"/api/auth/forgot-password\",o);n(t.message,\"success\"),r(),this.reset()}catch(t){n(t.message,\"error\")}});window.openLoginModal=c;window.closeLoginModal=s;window.openRegisterModal=g;window.closeRegisterModal=a;window.closeForgotPasswordModal=r;window.openForgotPasswordModal=u;window.switchToLogin=m;window.switchToRegister=f;window.togglePasswordVisibility=w;window.showNotification=n;window.closeNotification=y;window.loginWithGoogle=p;window.registerWithGoogle=h;window.checkLoginBeforeCart=M;window.toggleMobileMenu=E;"]],"assets":["/_astro/ayuda.CKRzGuqo.css","/_astro/AppLayout.astro_astro_type_script_index_0_lang.CxO_JRN6.js","/assets/images/ImageFooter.jpg","/assets/videos/Video1.mp4"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"9R0xdUCku4eXF6Ws8AhnlcUse28XaIURfxElacJpKUI="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
