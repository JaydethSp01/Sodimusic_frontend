/**
 * Datos estructurados (schema.org) renderizados en el HTML del servidor. A diferencia de
 * `next/script`, que los inyecta tras hidratar, así Google los lee en el primer rastreo.
 * `<` se escapa para que ningún texto del CMS pueda cerrar la etiqueta.
 */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
