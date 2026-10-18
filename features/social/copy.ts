import type { SocialPostKind } from "@/types/models";

/** Copys fijos de Novedades (no pasan por el CMS en esta iteración). */
export const SOCIAL_COPY = {
  eyebrow: "Novedades",
  homeTitle: "Lo último del sello",
  homeSubtitle: "Videos, lanzamientos y publicaciones recientes de Sodimusic y sus aliados.",
  homeAllLabel: "Ver todas las novedades",
  pageTitle: "Novedades",
  pageDescription: "Lo último que publicamos en YouTube y Facebook, en un solo lugar.",
  metaTitle: "Novedades",
  metaDescription:
    "Novedades de Sodimusic: nuevos videos en YouTube, publicaciones de Facebook y lanzamientos del sello y sus aliados.",
  listLabel: "Listado de novedades",
  chipsLabel: "Tipo de novedad",
  chipAll: "Todas",
  emptyAll: "Todavía no hay novedades publicadas. Vuelve pronto.",
  emptyFiltered: "No hay novedades de este tipo por ahora.",
  emptyCta: "Ver todas las novedades",
  watch: "Ver",
  open: "Abrir",
  pinned: "Fijado",
  updatedPrefix: "Actualizado",
} as const;

export const SOCIAL_KIND_LABEL: Record<SocialPostKind, string> = {
  YOUTUBE_VIDEO: "YouTube",
  FACEBOOK_POST: "Facebook",
  LINK: "Enlace",
};

/** Nombre de la red para textos accesibles ("Ver en YouTube"). */
export const SOCIAL_KIND_NETWORK: Record<SocialPostKind, string> = {
  YOUTUBE_VIDEO: "YouTube",
  FACEBOOK_POST: "Facebook",
  LINK: "el enlace",
};
