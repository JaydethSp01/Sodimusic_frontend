import { stringToHue } from "@/lib/string-to-hue";
import { cn } from "@/lib/utils";

function initialsFromSeed(seed: string): string {
  const parts = seed.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  return parts
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface PlaceholderCoverProps {
  seed: string;
  label?: string;
  className?: string;
}

export function PlaceholderCover({ seed, label, className }: PlaceholderCoverProps) {
  const hue = stringToHue(seed);
  const hue2 = (hue + 40) % 360;
  const text = label ?? initialsFromSeed(seed);

  return (
    <div
      className={cn("flex h-full w-full items-center justify-center", className)}
      style={{
        background: `linear-gradient(135deg, hsl(${hue}, 70%, 15%) 0%, hsl(${hue2}, 50%, 8%) 100%)`,
      }}
      aria-hidden
    >
      <span className="font-display text-4xl text-white/30">{text}</span>
    </div>
  );
}
