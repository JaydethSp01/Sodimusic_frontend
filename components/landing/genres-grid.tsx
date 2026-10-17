import { genreColor } from "@/lib/genre-colors";
import { Reveal } from "@/components/shared/reveal";
import { RevealItem } from "@/components/shared/reveal-item";
import { cn } from "@/lib/utils";

const genres = [
  {
    name: "Champeta",
    desc: "Donde empezó todo: María La Baja y la costa cerca de Cartagena, cuna del género y los ritmos africanos en el barrio.",
  },
  {
    name: "Trap",
    desc: "El mismo barrio, otra piel: la champeta en el ADN y el trap como proyección global.",
  },
  {
    name: "Reggaeton",
    desc: "Caribe urbano con cadencia de picó y calle.",
  },
  {
    name: "Afrobeat",
    desc: "La raíz africana que ya sonaba en la costa, en ritmo actual.",
  },
  {
    name: "Dancehall",
    desc: "Reggae y caribe que conviven con la champeta en la misma esquina sonora.",
  },
];

/**
 * Evita medias filas vacías: en 3 columnas (lg) y 2 (sm) el último ítem
 * se estira para completar la fila cuando sobra espacio.
 */
function spanClasses(index: number, total: number): string {
  const isLast = index === total - 1;
  if (!isLast) {
    return "";
  }
  const restLg = total % 3; // 0 → completo, 1 → sobra 2, 2 → sobra 1
  const restSm = total % 2;
  return cn(restSm === 1 && "sm:col-span-2", restLg === 1 && "lg:col-span-3", restLg === 2 && "lg:col-span-2");
}

export function GenresGrid() {
  return (
    <Reveal as="ul" variant="stagger" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {genres.map((g, i) => {
        const c = genreColor(g.name);
        return (
          <RevealItem
            as="li"
            key={g.name}
            className={cn(
              "group relative overflow-hidden rounded-lg border p-6 transition-[border-color,box-shadow,transform] duration-300 sm:p-7",
              "hover:shadow-[0_18px_40px_-20px_var(--genre-fg)] motion-safe:hover:-translate-y-1",
              spanClasses(i, genres.length),
            )}
            style={
              {
                "--genre-fg": c.fg,
                borderColor: c.border,
                background: `linear-gradient(135deg, ${c.bg} 0%, rgba(22,22,22,0.6) 100%)`,
              } as React.CSSProperties
            }
          >
            <span
              className="pointer-events-none absolute -right-6 -top-10 font-display text-[140px] leading-none opacity-[0.05] transition-opacity duration-300 group-hover:opacity-10"
              style={{ color: c.fg }}
              aria-hidden
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="display-title relative text-5xl md:text-6xl" style={{ color: c.fg }}>
              {g.name}
            </h3>
            <p className="relative mt-3 max-w-prose text-sm leading-relaxed text-[var(--text-secondary)] sm:text-[15px]">
              {g.desc}
            </p>
          </RevealItem>
        );
      })}
    </Reveal>
  );
}
