export type SiteNavLink = { href: string; label: string };

export type SiteMilestone = { year: string; title: string; desc: string };

export type SiteStat = { value: number; suffix: string; label: string };

export type SiteCrewMember = {
  name: string;
  genre: string;
  bio: string;
  /** Foto (URL absoluta o /uploads/...) */
  imageUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  tiktokUrl?: string;
  role?: string;
};

export type SiteLegal = {
  /** Nombre comercial */
  businessName: string;
  /** Razón social o nombre del comerciante persona natural; "" = pendiente */
  legalName: string;
  nit: string;
  address: string;
  city: string;
  country: string;
  /** Correo de PQR / datos personales */
  email: string;
  /** WhatsApp E.164 sin + */
  phone: string;
  hours: string;
  ivaIncluded: boolean;
  ivaResponsible: boolean;
  /** Anticipo del estudio, 0–100 */
  depositPercent: number;
  cancellationHours: number;
  policyVersion: string;
  termsVersion: string;
  showNewsletter: boolean;
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterCtaLabel: string;
  floatingWhatsapp: boolean;
};

export type SiteContactSubject = { value: string; label: string };

export type SiteContact = {
  pageTitle: string;
  pageDescription: string;
  subjects: SiteContactSubject[];
  pressTitle: string;
  pressBody: string;
  pressLogoUrl: string;
  pressPhotoUrls: string[];
  pressKitUrl: string;
};

/** Origen de la sección «Lo último» de la portada. */
export type SiteHomeLatestSource = "feed" | "productions" | "both";

export type SiteHomeLatest = {
  eyebrow: string;
  /** El acento serif («último») lo pone el componente con `Heading accent`; aquí va texto plano. */
  title: string;
  subtitle: string;
  /** "feed" = novedades automáticas (YouTube/Facebook) · "productions" = producciones destacadas · "both" = destacada del feed + producciones */
  source: SiteHomeLatestSource;
  limit: number;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type SiteHomeMerch = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  limit: number;
  onlyFeatured: boolean;
};

export type SiteHomeLead = {
  enabled: boolean;
  eyebrow: string;
  /** El acento serif («tema») lo pone el componente con `Heading accent`; aquí va texto plano. */
  title: string;
  subtitle: string;
  bullets: string[];
  ctaLabel: string;
  whatsappLabel: string;
  successMessage: string;
};

export type SiteTestimonial = { quote: string; author: string; role?: string; avatarUrl?: string };

export type SiteHomeTestimonials = { title: string; items: SiteTestimonial[] };

export type SiteYoutubeChannel = {
  name: string;
  /** URL pública del canal */
  url: string;
  /** ID de canal (UC…) para incrustar la lista de subidas sin API key */
  channelId?: string;
  description?: string;
  avatarUrl?: string;
  /** Video destacado (URL de YouTube); si falta se usa la lista de subidas */
  featuredVideoUrl?: string;
};

/** Preset de color (Admin → Sitio → «Tema y colores»); «custom» = valores propios. */
export type SiteThemePreset = "oro" | "naranja" | "mar" | "coral" | "custom";

/** Colores del sitio editables desde el CMS; se inyectan como variables CSS en `app/layout.tsx` (`lib/theme-css.ts`). */
export type SiteTheme = {
  preset: SiteThemePreset;
  /** Acento principal (fire-500), hex `#rrggbb` */
  accent: string;
  /** fire-300: texto de acento sobre oscuro */
  accentLight: string;
  /** fire-400: hover / enlaces */
  accentHover: string;
  /** fire-600 */
  accentDark: string;
  /** Acento de apoyo (sea-500) */
  secondary: string;
  /** sea-400 */
  secondaryLight: string;
  /** ink-0: fondo de página */
  background: string;
  /** ink-2: tarjetas; ink-1/3/4 se derivan */
  surface: string;
  /** Fondo del pie (`--footer-bg`) */
  footerBackground: string;
  /** Texto sobre el acento: auto = por contraste WCAG */
  textOnAccent: "auto" | "dark" | "light";
};

export type SiteContent = {
  brand: {
    logoText: string;
    siteNameLine?: string;
  };
  hero: {
    heroImageUrl: string;
    eyebrow: string;
    title: string;
    tagline: string;
    primaryCta: string;
    secondaryCta: string;
    primaryHref: string;
    secondaryHref: string;
  };
  home: {
    aboutEyebrow: string;
    aboutTitle: string;
    aboutBody: string;
    /** Imagen del panel lateral «Quiénes somos» */
    aboutImageUrl: string;
    aboutAsideCaption: string;
    genresEyebrow: string;
    genresTitle: string;
    storyEyebrow: string;
    storyTitle: string;
    portfolioEyebrow: string;
    portfolioTitle: string;
    portfolioCta: string;
    servicesEyebrow: string;
    servicesTitle: string;
    servicesSubtitle: string;
    contactTitle: string;
    contactSubtitle: string;
    milestones: SiteMilestone[];
    /** Cifras animadas bajo «Quiénes somos» */
    stats: SiteStat[];
    /** Sección única «Lo último» (sustituye a «Últimas producciones» + «Novedades») */
    latest: SiteHomeLatest;
    /** Merch en la portada (los productos viven en /api/products) */
    merch: SiteHomeMerch;
    /** Captación de cotizaciones (leads) */
    lead: SiteHomeLead;
    /** Testimonios; vacío = sección oculta */
    testimonials: SiteHomeTestimonials;
  };
  footer: {
    tagline: string;
    copyright: string;
    subline?: string;
  };
  seo: {
    homeTitle: string;
    homeDescription: string;
  };
  social: {
    youtube: string;
    instagram: string;
    facebook: string;
    spotify: string;
    tiktok: string;
  };
  contact: {
    email: string;
    whatsapp: string;
  };
  nav: {
    links: SiteNavLink[];
    ctaLabel: string;
    ctaHref: string;
    mobileFooterLine: string;
  };
  booking: {
    heroTitle: string;
    heroDescription: string;
    stepLabels: string[];
    services: { type: string; icon: string; title: string; desc: string; priceFromCOP?: number; priceNote?: string }[];
    genreChips: string[];
  };
  artists: {
    pageHeroTitle: string;
    pageHeroDescription: string;
    producerLabel: string;
    producerName: string;
    producerGenres: string[];
    producerBio: string;
    primaryCtaLabel: string;
    crewSectionTitle: string;
    crewSectionDescription: string;
    youtubeCtaLabel: string;
    producerImageUrl?: string;
    members: SiteCrewMember[];
  };
  beatsPage: {
    metaTitle: string;
    metaDescription: string;
    heroEyebrow?: string;
    heroTitle: string;
    heroDescriptionTemplate: string;
    heroImageUrl?: string;
  };
  productionsPage: {
    metaTitle: string;
    metaDescription: string;
    heroTitle: string;
    heroDescriptionTemplate: string;
    catalogCountLineTemplate: string;
    heroImageUrl?: string;
  };
  releasesPage: {
    metaTitle: string;
    metaDescription: string;
    heroEyebrow?: string;
    heroTitle: string;
    heroDescription: string;
    emptyStateMessage: string;
    heroImageUrl?: string;
  };
  bookingSuccess: {
    metaTitle: string;
    eyebrow: string;
    body: string;
    tagline: string;
    whatsappCtaLabel: string;
    homeLinkLabel: string;
  };
  releaseDetail: {
    upcomingBadge: string;
    moreSectionTitle: string;
    spotifyCtaLabel: string;
    youtubeCtaUpcoming: string;
    youtubeCtaReleased: string;
  };
  /** Canales de YouTube anclados (home y /artists) */
  youtube: {
    showOnHome: boolean;
    sectionEyebrow: string;
    sectionTitle: string;
    sectionSubtitle: string;
    subscribeLabel: string;
    /** Máximo de canales destacados en el home */
    homeLimit: number;
    allChannelsLabel: string;
    pageTitle: string;
    pageDescription: string;
    /** Obsoleto: los canales viven en /api/channels. Se conserva para datos antiguos. */
    channels: SiteYoutubeChannel[];
  };
  legal: SiteLegal;
  contactPage: SiteContact;
  /** Tienda / marketplace de merch (los productos viven en la API: /api/products) */
  shop: {
    enabled: boolean;
    navLabel: string;
    metaTitle: string;
    metaDescription: string;
    heroEyebrow?: string;
    heroTitle: string;
    heroDescription: string;
    heroImageUrl?: string;
    emptyStateMessage: string;
    orderCtaLabel: string;
    addToCartLabel: string;
    whatsappOrderIntro: string;
    shippingNote?: string;
    showOnHome: boolean;
    homeSectionEyebrow: string;
    homeSectionTitle: string;
    homeSectionSubtitle: string;
    homeCtaLabel: string;
  };
  /** Colores del sitio (ver `lib/theme-presets.ts`) */
  theme: SiteTheme;
  /** Código QR que lleva a la página */
  qr: {
    /** URL destino; vacío = NEXT_PUBLIC_SITE_URL */
    targetUrl?: string;
    label: string;
    showInFooter: boolean;
    footerCaption: string;
  };
};
