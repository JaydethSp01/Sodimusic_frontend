import { cn } from "@/lib/utils";

/** Ayuda breve bajo un campo (texto 3). */
export function FieldHint({ id, children, className }: { id?: string; children?: React.ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p id={id} className={cn("mt-1.5 text-body-sm text-text-3", className)}>
      {children}
    </p>
  );
}
