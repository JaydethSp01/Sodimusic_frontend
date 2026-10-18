import { Badge } from "@/components/ui/badge";
import { GENRE_ACCENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface GenreTagProps {
  genre: string;
  className?: string;
}

/**
 * Wrapper de compatibilidad: `Badge` outline con el color del género (GENRE_ACCENTS) en una
 * pastilla pequeña. El color va solo en el texto y el borde, nunca en bloques grandes.
 */
export function GenreTag({ genre, className }: GenreTagProps) {
  const color = GENRE_ACCENTS[genre];
  return (
    <Badge variant="outline" tone="neutral" size="sm" className={cn(className)} style={color ? { color, borderColor: color } : undefined}>
      {genre}
    </Badge>
  );
}
