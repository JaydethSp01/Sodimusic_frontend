import { cn } from "@/lib/utils";
import { GENRE_ACCENTS } from "@/lib/constants";

interface GenreTagProps {
  genre: string;
  className?: string;
}

export function GenreTag({ genre, className }: GenreTagProps) {
  const color = GENRE_ACCENTS[genre] ?? "var(--text-secondary)";
  return (
    <span
      className={cn("inline-block rounded px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider", className)}
      style={{ color, border: `1px solid ${color}` }}
    >
      {genre}
    </span>
  );
}
