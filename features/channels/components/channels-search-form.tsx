"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildChannelsHref } from "@/features/channels/hrefs";

interface ChannelsSearchFormProps {
  initialQuery?: string;
  category?: string;
  placeholder?: string;
}

/**
 * Buscador de canales: formulario GET nativo (funciona sin JS) que, con JS,
 * navega con `router.push` dentro de una transición para mostrar estado de carga.
 */
export function ChannelsSearchForm({ initialQuery = "", category, placeholder = "Buscar canal, artista o @handle" }: ChannelsSearchFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => {
      router.push(buildChannelsHref({ q: value, category }));
    });
  }

  function onClear() {
    setValue("");
    startTransition(() => {
      router.push(buildChannelsHref({ category }));
    });
  }

  return (
    <form method="get" action="/canales" role="search" onSubmit={onSubmit} className="flex w-full max-w-xl gap-2">
      {category ? <input type="hidden" name="category" value={category} /> : null}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden />
        <Input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Buscar canales"
          autoComplete="off"
          className="h-11 bg-background-card pl-9 pr-9"
        />
        {value ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Limpiar búsqueda"
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-background-elevated hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>
      <Button type="submit" className="h-11" disabled={pending} aria-busy={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
        Buscar
      </Button>
    </form>
  );
}
