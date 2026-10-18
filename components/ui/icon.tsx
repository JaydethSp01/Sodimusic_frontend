import type { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/** Wrapper de Lucide: tamaños 16/20/24 y stroke 1.75. Nunca emojis como iconos. */
export interface IconProps extends Omit<LucideProps, "size" | "ref"> {
  icon: LucideIcon;
  size?: 16 | 20 | 24;
}

const SIZE = { 16: "h-4 w-4", 20: "h-5 w-5", 24: "h-6 w-6" } as const;

export function Icon({ icon: Lucide, size = 20, className, strokeWidth = 1.75, ...props }: IconProps) {
  return <Lucide className={cn("shrink-0", SIZE[size], className)} strokeWidth={strokeWidth} aria-hidden {...props} />;
}
