"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
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
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" strokeWidth={1.75} aria-hidden />
        <Input
          type="search"
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Buscar canales"
          autoComplete="off"
          className="pl-10 pr-12"
        />
        {value ? (
          <IconButton type="button" onClick={onClear} aria-label="Limpiar búsqueda" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2">
            <X />
          </IconButton>
        ) : null}
      </div>
      <Button type="submit" loading={pending}>
        Buscar
      </Button>
    </form>
  );
}
