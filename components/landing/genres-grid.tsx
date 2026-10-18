import { EditorialList } from "@/components/ds/editorial-list";
import { Badge } from "@/components/ui/badge";
import { genreColor } from "@/lib/genre-colors";

export type HomeGenre = { name: string; desc: string; tag: string };

/** Los cinco géneros del sello (también en el JSON-LD de la home). */
export const HOME_GENRES: HomeGenre[] = [
  {
    name: "Champeta",
    tag: "Raíz",
    desc: "Donde empezó todo: María La Baja y la costa cerca de Cartagena, cuna del género y los ritmos africanos en el barrio.",
  },
  {
    name: "Trap",
    tag: "Proyección",
    desc: "El mismo barrio, otra piel: la champeta en el ADN y el trap como proyección global.",
  },
  {
    name: "Reggaeton",
    tag: "Picó",
    desc: "Caribe urbano con cadencia de picó y calle.",
  },
  {
    name: "Afrobeat",
    tag: "África",
    desc: "La raíz africana que ya sonaba en la costa, en ritmo actual.",
  },
  {
    name: "Dancehall",
    tag: "Caribe",
    desc: "Reggae y caribe que conviven con la champeta en la misma esquina sonora.",
  },
];

/**
 * Géneros como lista editorial: número serif, nombre en display, descripción y, en escritorio con
 * puntero fino, una imagen flotante que sigue al cursor. El color del género va solo en la pastilla.
 * `images`: portada por género (nombre normalizado → URL), p. ej. de las producciones del catálogo.
 */
export function GenresGrid({ images = {} }: { images?: Record<string, string> }) {
  return (
    <EditorialList
      items={HOME_GENRES.map((g, i) => {
        const c = genreColor(g.name);
        return {
          id: g.name.toLowerCase(),
          index: i + 1,
          title: g.name,
          description: g.desc,
          size: "display-sm" as const,
          imageUrl: images[g.name.toLowerCase()] ?? null,
          imageAlt: "",
          aside: (
            <Badge variant="outline" className="hidden sm:inline-flex" style={{ color: c.fg, borderColor: c.border }}>
              {g.tag}
            </Badge>
          ),
        };
      })}
    />
  );
}
