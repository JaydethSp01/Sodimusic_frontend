import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * `cn` = clsx + tailwind-merge con los utilitarios del sistema registrados: sin esto, tailwind-merge
 * toma `text-display-lg` o `text-label` por un color y los descarta cuando van junto a `text-text-1`.
 */
const twMerge = extendTailwindMerge<"accent">({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display-xl", "display-lg", "display-md", "display-sm", "title", "body-lg", "body", "body-sm", "label", "label-sm"] },
      ],
      "font-family": [{ font: ["display", "accent", "body", "mono"] }],
      accent: ["text-accent"],
      tracking: [{ tracking: ["display", "label", "wordmark"] }],
      shadow: [{ shadow: ["card", "fire", "pop"] }],
      z: [{ z: ["nav", "player", "overlay", "modal", "toast"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
