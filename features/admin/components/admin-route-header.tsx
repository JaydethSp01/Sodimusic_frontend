"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

/**
 * Cabecera de ruta del panel: eyebrow mono + `<h1>` display-sm + descripción. Es el único `<h1>` de
 * cada módulo (los e2e lo buscan por nombre: «Panel», «Mensajes», «Canales de YouTube»…).
 */
const routes: { match: string; title: string; description: string }[] = [
  { match: "/admin/dashboard", title: "Panel", description: "Resumen del día a día: sesiones, beats, mensajes, suscriptores, visitas, producciones y tienda." },
  { match: "/admin/dashboard/site", title: "Sitio web público", description: "Textos, imágenes y secciones de la web. Guarda un borrador, previsualízalo y publícalo cuando esté listo." },
  { match: "/admin/dashboard/sessions", title: "Sesiones", description: "Alta manual, cambio de estado, notas internas y eliminación. Las confirmaciones pueden avisar al artista por correo." },
  { match: "/admin/dashboard/productions", title: "Producciones", description: "Portafolio público: título, artista, ciudad, año, género y video de YouTube." },
  { match: "/admin/dashboard/beats", title: "Beats", description: "Catálogo de beats: estado, precios por licencia, portada y preview de audio." },
  { match: "/admin/dashboard/releases", title: "Releases", description: "Lanzamientos con smart links, fecha y portada. Lo que se ve en /releases." },
  { match: "/admin/dashboard/tienda", title: "Tienda", description: "Productos, precios, tallas, stock e imágenes. Los activos se muestran en /tienda." },
  { match: "/admin/dashboard/canales", title: "Canales de YouTube", description: "Canales que aparecen en la web y alimentan las novedades. Ordena, destaca u oculta." },
  { match: "/admin/dashboard/novedades", title: "Novedades", description: "Lo último de YouTube y Facebook: sincronización, fuentes y publicaciones del feed público." },
  { match: "/admin/dashboard/mensajes", title: "Mensajes", description: "Formulario de contacto/prensa e intereses en beats. Marca como leído lo atendido y archiva lo cerrado." },
  { match: "/admin/dashboard/suscriptores", title: "Suscriptores", description: "Lista del boletín con autorización de datos (Ley 1581/2012). Las bajas se conservan con su fecha." },
  { match: "/admin/dashboard/calendar", title: "Calendario del estudio", description: "Sesiones por franja y bloqueos de fechas. Lo que ves aquí es lo que ofrece /booking." },
  { match: "/admin/dashboard/qr", title: "Estudio de código QR", description: "Genera y descarga el código QR de tu página para flyers, tarjetas y redes." },
];

export function AdminRouteHeader() {
  const pathname = usePathname();

  const current = useMemo(() => {
    const hit = [...routes].reverse().find((r) => pathname.startsWith(r.match));
    return hit ?? routes[0];
  }, [pathname]);

  return (
    <header className="mb-6 border-b border-line-1 pb-6 md:mb-8">
      <p className="text-label text-text-3">Panel admin</p>
      <Heading as="h1" size="display-sm" className="mt-2">
        {current.title}
      </Heading>
      <Text size="body-sm" tone="2" className="mt-2 container-prose">
        {current.description}
      </Text>
    </header>
  );
}
