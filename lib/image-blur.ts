/** Placeholder oscuro genérico para portadas remotas (evita saltos de layout y flashes claros). */
export const BLUR_DATA_URL = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxNDEyMTAiLz48cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI0IiBmaWxsPSIjMWIxODE2Ii8+PC9zdmc+";

/** Props comunes para `next/image` en portadas de tarjetas. */
export const COVER_IMAGE_PROPS = {
  quality: 70,
  placeholder: "blur",
  blurDataURL: BLUR_DATA_URL,
} as const;
