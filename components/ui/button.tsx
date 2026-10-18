import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Botón del sistema (contrato v4 §3). Variantes: primary (fire + shadow-fire), secondary (ink-3),
 * outline (línea 2 → fire en hover), ghost, link, whatsapp, danger. Tamaños 36/44/52/60 e icon 44.
 * Alias de compatibilidad: `default` = primary, `destructive` = danger, tamaño `default` = md.
 * `pill` redondea del todo; `withArrow` añade una flecha que se desplaza 4 px en hover;
 * `loading` muestra un spinner, pone `aria-busy` y desactiva el botón.
 */
const buttonVariants = cva(
  "group/btn inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded font-body font-semibold transition-[color,background-color,border-color,box-shadow,filter] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-fire-500 text-fire-on shadow-fire hover:bg-fire-400",
        secondary: "border border-line-1 bg-ink-3 text-text-1 hover:border-line-2 hover:bg-ink-4",
        outline: "border border-line-2 bg-transparent text-text-1 hover:border-fire-500 hover:text-fire-300",
        ghost: "text-text-1 hover:bg-white/[0.06]",
        link: "text-fire-400 underline-offset-4 hover:text-fire-300 hover:underline",
        whatsapp: "bg-whatsapp text-sea-on hover:brightness-110",
        danger: "bg-danger text-ink-0 hover:brightness-110",
        /* alias */
        default: "bg-fire-500 text-fire-on shadow-fire hover:bg-fire-400",
        destructive: "bg-danger text-ink-0 hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4 text-body-sm",
        md: "h-11 px-5 text-body",
        lg: "h-[52px] px-6 text-body [&_svg]:size-5",
        xl: "h-[60px] px-8 text-body-lg [&_svg]:size-5",
        icon: "h-11 w-11 p-0 [&_svg]:size-5",
        /* alias */
        default: "h-11 px-5 text-body",
      },
      pill: {
        true: "rounded-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      pill: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Flecha a la derecha que se desplaza 4 px en hover. */
  withArrow?: boolean;
  /** Spinner + `aria-busy` + desactivado. */
  loading?: boolean;
}

const Arrow = () => (
  <ArrowRight
    className="transition-transform duration-150 ease-out group-hover/btn:translate-x-1 motion-reduce:transform-none"
    aria-hidden
  />
);

const Spinner = () => <Loader2 className="animate-spin" aria-hidden />;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, pill, asChild = false, withArrow = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const classes = cn(
      buttonVariants({ variant, size, pill }),
      variant === "link" && "h-auto rounded-none px-0 shadow-none",
      className,
    );
    const decorate = (content: React.ReactNode) => (
      <>
        {loading ? <Spinner /> : null}
        {content}
        {withArrow && !loading ? <Arrow /> : null}
      </>
    );

    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement<{ children?: React.ReactNode }>;
      const inner = withArrow || loading ? React.cloneElement(child, undefined, decorate(child.props.children)) : child;
      return (
        <Slot className={classes} ref={ref} aria-busy={loading || undefined} aria-disabled={disabled || loading || undefined} {...props}>
          {inner}
        </Slot>
      );
    }

    return (
      <button className={classes} ref={ref} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
        {decorate(children)}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
