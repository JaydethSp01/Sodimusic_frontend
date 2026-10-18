export interface Production {
  id: string;
  title: string;
  artistName: string;
  artistCity: string;
  artistCountry: string;
  year: number;
  genre: string;
  coverUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Beat {
  id: string;
  title: string;
  genre: string;
  bpm: number | null;
  mood: string | null;
  /** Precio "desde" (licencia más barata) */
  priceCOP: number;
  priceMp3COP?: number | null;
  priceWavCOP?: number | null;
  priceStemsCOP?: number | null;
  priceExclusiveCOP?: number | null;
  status: string;
  /** Preview de audio (MP3) */
  audioUrl: string | null;
  coverUrl: string | null;
  exclusive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Release {
  id: string;
  title: string;
  slug: string;
  artistName: string;
  genre: string;
  releaseYear: number;
  coverUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  appleUrl?: string | null;
  deezerUrl?: string | null;
  amazonUrl?: string | null;
  tidalUrl?: string | null;
  soundcloudUrl?: string | null;
  /** ISO date */
  releaseDate?: string | null;
  description: string | null;
  featured: boolean;
  /** true = aparece en /releases (próximos y adelantos). false = solo catálogo interno / producciones pasadas. */
  upcoming?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingSessionRow {
  id: string;
  serviceType: string;
  artistName: string;
  artistEmail: string;
  artistPhone: string;
  artistInstagram: string | null;
  musicReference: string;
  vision: string | null;
  genres: string;
  isFirstTime: boolean;
  scheduledDate: string;
  timeSlot: string;
  status: string;
  internalNotes: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = "ACTIVE" | "DRAFT" | "SOLD_OUT";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceCOP: number;
  /** Precio anterior (tachado) opcional */
  compareAtCOP: number | null;
  category: string;
  /** URLs absolutas o /uploads/... (la primera es la portada) */
  images: string[];
  /** Tallas/variantes, p. ej. ["S","M","L"] */
  sizes: string[];
  /** null = sin control de inventario */
  stock: number | null;
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type ChannelStatus = "ACTIVE" | "HIDDEN";

export interface YoutubeChannel {
  id: string;
  name: string;
  url: string;
  channelId: string | null;
  handle: string | null;
  description: string | null;
  avatarUrl: string | null;
  featuredVideoUrl: string | null;
  category: string;
  featured: boolean;
  status: ChannelStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type ContactSubject = "PRENSA" | "DEMO" | "BOOKING_ARTISTA" | "COLABORACION" | "OTRO";
export type ContactStatus = "NEW" | "READ" | "ARCHIVED";

export interface ContactMessage {
  id: string;
  subject: ContactSubject | string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  policyAcceptedAt: string;
  policyVersion: string;
  status: ContactStatus;
  createdAt: string;
}

export type BeatLicenseType = "MP3" | "WAV" | "STEMS" | "EXCLUSIVE";

export interface BeatInterestRow {
  id: string;
  beatId: string | null;
  beatTitle: string;
  artistName: string;
  email: string;
  phone: string | null;
  instagram: string | null;
  message: string | null;
  exclusiveIntent: boolean;
  licenseType: BeatLicenseType | null;
  policyAcceptedAt: string;
  policyVersion: string;
  marketingOptIn: boolean;
  createdAt: string;
}

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string;
  policyAcceptedAt: string;
  policyVersion: string;
  unsubscribedAt: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Novedades (feed social)                                             */
/* ------------------------------------------------------------------ */

export type SocialPostKind = "YOUTUBE_VIDEO" | "FACEBOOK_POST" | "LINK";

export interface SocialPost {
  id: string;
  sourceId: string | null;
  kind: SocialPostKind;
  /** `yt:<videoId>` | `fb:<postId>` | `link:<sha1(url)>` */
  externalId: string;
  title: string;
  text: string | null;
  url: string;
  imageUrl: string | null;
  author: string | null;
  /** ISO date */
  publishedAt: string;
  status: "VISIBLE" | "HIDDEN";
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SocialSourceKind = "YOUTUBE_CHANNEL" | "FACEBOOK_PAGE" | "YOUTUBE_SEARCH";

export interface SocialSource {
  id: string;
  kind: SocialSourceKind;
  label: string;
  /** `UC…` | id o username de la página | texto de búsqueda */
  externalId: string;
  url: string | null;
  enabled: boolean;
  lastFetchedAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialSyncSummary {
  ok: boolean;
  startedAt: string;
  finishedAt: string;
  added: number;
  updated: number;
  sources: Array<{ id: string; label: string; kind: SocialSourceKind; added: number; updated: number; error?: string }>;
}

export interface SocialStatus {
  lastSyncAt: string | null;
  env: { youtubeApiKey: boolean; facebookPageToken: boolean; cronSecret: boolean };
  counts: { sources: number; posts: number; hidden: number };
}
