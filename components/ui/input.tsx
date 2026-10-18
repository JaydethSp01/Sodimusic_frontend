import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** Campo de texto: ink-3, línea 1, 44 px, anillo fire al foco; `aria-invalid` lo pinta en danger. */
export const inputClass =
  "flex h-11 w-full rounded border border-line-1 bg-ink-3 px-3.5 text-body text-text-1 transition-[border-color,box-shadow] duration-150 file:border-0 file:bg-transparent file:text-body-sm file:font-medium placeholder:text-text-3 hover:border-line-2 focus-visible:border-fire-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500/40 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/40";

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return <input type={type} className={cn(inputClass, className)} ref={ref} {...props} />;
});
Input.displayName = "Input";

export { Input };
