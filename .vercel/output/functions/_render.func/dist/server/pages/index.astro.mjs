import { e as createComponent, k as renderComponent, r as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_z5fA6ZdE.mjs';
import 'piccolore';
import { $ as $$AppLayout } from '../chunks/AppLayout_EERWYm_p.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  const title = "ATRAVEL - Tu pr\xF3ximo viaje espera";
  return renderTemplate`${renderComponent($$result, "AppLayout", $$AppLayout, { "title": title }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<section class="hero-section"> <div class="hero-background"> <video autoplay muted loop class="hero-video"> <source src="/assets/videos/Video1.mp4" type="video/mp4">
Tu navegador no soporta videos.
</video> </div> <div class="hero-overlay"></div> <div class="hero-content"> <div class="hero-badge">Viajes increíbles te esperan</div> <h2 class="hero-title">Descubre el Perú sin límites</h2> <p class="hero-subtitle">Paquetes turísticos exclusivos diseñados para tus aventuras soñadas</p> <div class="hero-features"> <div class="hero-feature-item"> <i class="fas fa-globe feature-icon"></i> <span class="feature-text">150+ Destinos</span> </div> <div class="hero-feature-item"> <i class="fas fa-star feature-icon"></i> <span class="feature-text">5 Estrellas</span> </div> <div class="hero-feature-item"> <i class="fas fa-users feature-icon"></i> <span class="feature-text">50K+ Viajeros</span> </div> </div> <div class="hero-actions"> <button class="btn-hero-primary">Explorar Ahora</button> <button class="btn-hero-secondary">Hacer Reserva</button> </div> </div> </section>  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"> <!-- Features Section --> <section class="features-section"> <h2 class="features-title">¿Por qué elegir ATRAVEL?</h2> <div class="features-grid"> <div class="feature-card"> <i class="fas fa-coins feature-card-icon"></i> <h3 class="feature-heading">Mejores Precios</h3> <p class="feature-text">Garantizamos los precios más competitivos sin comprometer la calidad de tu viaje</p> </div> <div class="feature-card"> <i class="fas fa-lock feature-card-icon"></i> <h3 class="feature-heading">100% Seguro</h3> <p class="feature-text">Todas nuestras agencias son certificadas y tus viajes están asegurados</p> </div> <div class="feature-card"> <i class="fas fa-headset feature-card-icon"></i> <h3 class="feature-heading">Soporte 24/7</h3> <p class="feature-text">Equipo disponible en todo momento durante tu experiencia de viaje</p> </div> <div class="feature-card"> <i class="fas fa-check-circle feature-card-icon"></i> <h3 class="feature-heading">Verificado</h3> <p class="feature-text">Miles de viajeros satisfechos nos recomiendan cada año</p> </div> </div> </section> </main> ` })}`;
}, "C:/Users/admin/Documents/temp/ATRAVEL/src/pages/index.astro", void 0);

const $$file = "C:/Users/admin/Documents/temp/ATRAVEL/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Index,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
