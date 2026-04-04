export type SiteNavLink = { href: string; label: string };

export type SiteMilestone = { year: string; title: string; desc: string };

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
    members: { name: string; genre: string; bio: string }[];
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
};
