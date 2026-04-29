type NavLink = {
  href: string;
  label: string;
};

type FeatureItem = {
  icon: string;
  label: string;
};

type InfoCard = {
  icon: string;
  title: string;
  text: string;
};

const defaultBrand = "ATRAVEL";

function envNumber(name: string, fallback: number): number {
  const raw = import.meta.env[name];
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeWhatsappDigits(value: string | undefined, fallback: string): string {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits.length > 0 ? digits : fallback;
}

export const siteIdentity = {
  brand: import.meta.env.PUBLIC_BRAND_NAME ?? defaultBrand,
  adminBrand: import.meta.env.PUBLIC_ADMIN_BRAND_NAME ?? `${import.meta.env.PUBLIC_BRAND_NAME ?? defaultBrand} Admin`,
  appTitleDefault: import.meta.env.PUBLIC_APP_TITLE_DEFAULT ?? `${import.meta.env.PUBLIC_BRAND_NAME ?? defaultBrand} - Tu proximo viaje espera`,
  adminTitleDefault: import.meta.env.PUBLIC_ADMIN_TITLE_DEFAULT ?? `Panel Administrativo - ${import.meta.env.PUBLIC_BRAND_NAME ?? defaultBrand}`,
};

export const contactConfig = {
  whatsappDigits: normalizeWhatsappDigits(import.meta.env.PUBLIC_WHATSAPP_RESERVAS, "51987654321"),
};

export const adminSessionConfig = {
  idleTimeoutMs: envNumber("PUBLIC_ADMIN_IDLE_TIMEOUT_MS", 15 * 60 * 1000),
  pingThrottleMs: envNumber("PUBLIC_ADMIN_PING_THROTTLE_MS", 60 * 1000),
  defaultDisplayName: import.meta.env.PUBLIC_ADMIN_DEFAULT_NAME ?? "Admin",
  avatarBackground: import.meta.env.PUBLIC_ADMIN_AVATAR_BG ?? "0D8ABC",
  avatarColor: import.meta.env.PUBLIC_ADMIN_AVATAR_COLOR ?? "fff",
};

export const headerConfig = {
  navigationLinks: [
    { href: "/", label: "Principal" },
    { href: "/tours", label: "Tours" },
  ] as NavLink[],
  reserveHref: "/tours",
  reserveLabel: "Reservar tours",
};

export const homePageConfig = {
  title: `${siteIdentity.brand} - Tu proximo viaje espera`,
  heroBadge: "Viajes increibles te esperan",
  heroTitle: "Descubre el Peru sin limites",
  heroSubtitle: "Empieza aqui: toca Ver Tours y elige tu siguiente viaje en un solo paso",
  heroFeatures: [
    { icon: "fas fa-globe", label: import.meta.env.PUBLIC_HOME_METRIC_DESTINOS ?? "150+ Destinos" },
    { icon: "fas fa-star", label: import.meta.env.PUBLIC_HOME_METRIC_REPUTACION ?? "5 Estrellas" },
    { icon: "fas fa-users", label: import.meta.env.PUBLIC_HOME_METRIC_VIAJEROS ?? "50K+ Viajeros" },
  ] as FeatureItem[],
  primaryAction: { href: "/tours#tours-content", label: "Ver Tours" },
  secondaryAction: { href: "/tours#tours-content", label: "Reservar ahora" },
  featuresTitle: `Por que elegir ${siteIdentity.brand}?`,
  featureCards: [
    {
      icon: "fas fa-coins",
      title: "Mejores Precios",
      text: "Garantizamos los precios mas competitivos sin comprometer la calidad de tu viaje",
    },
    {
      icon: "fas fa-lock",
      title: "100% Seguro",
      text: "Todas nuestras agencias son certificadas y tus viajes estan asegurados",
    },
    {
      icon: "fas fa-headset",
      title: "Soporte 24/7",
      text: "Equipo disponible en todo momento durante tu experiencia de viaje",
    },
    {
      icon: "fas fa-check-circle",
      title: "Verificado",
      text: "Miles de viajeros satisfechos nos recomiendan cada ano",
    },
  ] as InfoCard[],
};

export const toursPageConfig = {
  title: "Tours AT - Recorridos Turisticos",
  heroBadge: "Experiencias unicas garantizadas",
  heroTitle: "Recorridos Turisticos Tours AT",
  heroSubtitle: "Descubre nuestros recorridos predeterminados disenados especialmente para enamorarte del Peru",
  heroFeatures: [
    { icon: "fas fa-route", label: import.meta.env.PUBLIC_TOURS_METRIC_RUTAS ?? "25+ Rutas" },
    { icon: "fas fa-calendar-days", label: import.meta.env.PUBLIC_TOURS_METRIC_SALIDAS ?? "Salidas Diarias" },
    { icon: "fas fa-thumbs-up", label: import.meta.env.PUBLIC_TOURS_METRIC_RATING ?? "98% Rating" },
  ] as FeatureItem[],
  primaryActionLabel: "Ver Todos",
  secondaryActionLabel: "Consultar tours",
  sectionTitle: "Recorridos disponibles",
  whyChooseTitle: "Por que elegir Atravel?",
  whyChooseCards: [
    { icon: "fas fa-shield-check", title: "100% Asegurado", text: "Todos nuestros tours estan completamente asegurados. Tu seguridad es nuestra prioridad." },
    { icon: "fas fa-user-tie", title: "Guias Expertos", text: "Guias locales certificados con anos de experiencia en cada ruta que ofrecemos." },
    { icon: "fas fa-utensils", title: "Comida Incluida", text: "Disfruta de la autentica gastronomia peruana en cada recorrido que realizamos." },
    { icon: "fas fa-check-circle", title: "Cancelacion Gratuita", text: "Cancela tu reserva hasta 48 horas antes sin cargos adicionales." },
    { icon: "fas fa-headset", title: "Soporte 24/7", text: "Equipo disponible en todo momento durante tu viaje para cualquier necesidad." },
    { icon: "fas fa-star", title: "Experiencias Premium", text: "Acceso exclusivo a lugares no turisticos y experiencias autenticas unicamente en Tours AT." },
  ] as InfoCard[],
};

export const footerConfig = {
  description: "Tu plataforma confiable de viajes. Conectando aventuras con sonadores desde 2020.",
};

export const cacheConfig = {
  filePath: import.meta.env.TOURS_CACHE_FILE ?? "./src/data/tours-cache.json",
  directoryPath: import.meta.env.TOURS_CACHE_DIR ?? "./src/data",
};
