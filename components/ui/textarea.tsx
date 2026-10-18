import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded border border-line-1 bg-ink-3 px-3.5 py-3 text-body text-text-1 transition-[border-color,box-shadow] duration-150 placeholder:text-text-3 hover:border-line-2 focus-visible:border-fire-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500/40 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/40",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
