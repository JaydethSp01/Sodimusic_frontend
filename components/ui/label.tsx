"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

/** Etiqueta de campo: 14 px / 500, texto 1. `required` añade un asterisco naranja. */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("inline-block text-body-sm font-medium leading-none text-text-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  >
    {children}
    {required ? (
      <span className="ml-1 text-fire-500" aria-hidden>
        *
      </span>
    ) : null}
  </LabelPrimitive.Root>
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
