export const SITE_NAME = "Sodimusic Company";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP ?? "573215368590";

export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const CONTACT_EMAIL = "Jeivymusicdinero@gmail.com";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? CONTACT_EMAIL;

export const SOCIAL = {
  youtube: "https://www.youtube.com/channel/UCbCYvwiAsoIdumPbFBe1x6A",
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/sodimusic.oficial",
  spotify: "https://open.spotify.com/",
  tiktok: "https://www.tiktok.com/@sodimusic",
} as const;

export const GENRE_FILTER_VALUES = ["Trap", "Reggaeton", "Afrobeat", "Dancehall"] as const;

export type GenreFilter = (typeof GENRE_FILTER_VALUES)[number];

export const GENRE_ACCENTS: Record<string, string> = {
  Trap: "var(--primary)",
  Reggaeton: "#9B59B6",
  Afrobeat: "var(--gold)",
  Dancehall: "#27AE60",
};

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  VOCAL_RECORDING: "Grabación vocal",
  BEAT_PRODUCTION: "Beat personalizado",
  COPRODUCTION: "Coproducción",
  MIX_MASTER: "Mezcla y masterización",
  CONSULTING: "Consultoría artística",
};

export const TIME_SLOT_LABELS: Record<string, string> = {
  morning: "Mañana (9am – 12pm)",
  afternoon: "Tarde (2pm – 6pm)",
  night: "Noche (7pm – 10pm)",
};
