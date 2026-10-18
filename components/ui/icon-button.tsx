import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Botón de solo icono (Lucide 20 px, stroke 1.75). `aria-label` obligatorio.
 * Mismas variantes que `Button`; redondo (`pill`) por defecto. Tamaños 36/44/52.
 */
const iconButtonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center transition-[color,background-color,border-color,box-shadow,filter] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 [&_svg]:stroke-[1.75]",
  {
    variants: {
      variant: {
        primary: "bg-fire-500 text-fire-on shadow-fire hover:bg-fire-400",
        secondary: "border border-line-1 bg-ink-3 text-text-1 hover:border-line-2 hover:bg-ink-4",
        outline: "border border-line-2 bg-transparent text-text-2 hover:border-fire-500 hover:text-fire-300",
        ghost: "text-text-2 hover:bg-white/[0.06] hover:text-text-1",
        whatsapp: "bg-whatsapp text-sea-on hover:brightness-110",
        danger: "bg-danger text-ink-0 hover:brightness-110",
      },
      size: {
        sm: "h-9 w-9 [&_svg]:size-4",
        md: "h-11 w-11",
        lg: "h-[52px] w-[52px] [&_svg]:size-6",
      },
      pill: {
        true: "rounded-full",
        false: "rounded",
      },
    },
    defaultVariants: { variant: "ghost", size: "md", pill: true },
  },
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  "aria-label": string;
  asChild?: boolean;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, pill, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : (type ?? "button")}
        className={cn(iconButtonVariants({ variant, size, pill }), className)}
        {...props}
      />
    );
  },
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
