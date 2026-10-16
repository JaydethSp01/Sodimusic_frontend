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
};

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
    services: { type: string; icon: string; title: string; desc: string }[];
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
    channels: SiteYoutubeChannel[];
  };
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
  /** Código QR que lleva a la página */
  qr: {
    /** URL destino; vacío = NEXT_PUBLIC_SITE_URL */
    targetUrl?: string;
    label: string;
    showInFooter: boolean;
    footerCaption: string;
  };
};
