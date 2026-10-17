/** Rutas públicas del paquete legal (orden del índice lateral y del footer). Sin dependencias para poder usarse en cliente. */
export const LEGAL_ROUTES = [
  { href: "/legal/privacidad", label: "Política de privacidad", short: "Privacidad" },
  { href: "/legal/terminos-tienda", label: "Términos de la tienda", short: "Tienda" },
  { href: "/legal/terminos-estudio", label: "Términos del estudio", short: "Estudio" },
  { href: "/legal/licencia-beats", label: "Licencia de beats", short: "Beats" },
  { href: "/legal/aviso-legal", label: "Aviso legal", short: "Aviso legal" },
] as const;
