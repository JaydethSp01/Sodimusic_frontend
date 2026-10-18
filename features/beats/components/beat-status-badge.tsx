import { Badge } from "@/components/ui/badge";
import type { Beat } from "@/types/models";

/** Estado del beat como `Badge`: vendido (neutral), exclusivo (gold) o disponible (success). */
export function BeatStatusBadge({ beat, size = "sm" }: { beat: Pick<Beat, "status" | "exclusive">; size?: "sm" | "md" }) {
  if (beat.status === "SOLD") {
    return (
      <Badge tone="neutral" variant="outline" size={size}>
        Vendido
      </Badge>
    );
  }
  if (beat.status === "EXCLUSIVE" || beat.exclusive) {
    return (
      <Badge tone="gold" size={size}>
        Exclusivo
      </Badge>
    );
  }
  return (
    <Badge tone="success" size={size}>
      Disponible
    </Badge>
  );
}
