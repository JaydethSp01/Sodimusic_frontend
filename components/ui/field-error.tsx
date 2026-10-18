import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Mensaje de error de campo (danger + icono). Se anuncia con `role="alert"`. */
export function FieldError({ id, children, className }: { id?: string; children?: React.ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className={cn("mt-1.5 flex items-start gap-1.5 text-body-sm text-danger", className)}>
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
      <span>{children}</span>
    </p>
  );
}
