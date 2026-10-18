"use client";

import { Play, X, Youtube } from "lucide-react";
import type { YoutubeChannel } from "@/types/models";
import { ListRow } from "@/components/ds/list-row";
import { YoutubeLazyEmbed } from "@/components/landing/youtube-lazy-embed";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { stringToHue } from "@/lib/string-to-hue";
import { subscribeUrl } from "@/lib/youtube";
import { channelEmbedSrc } from "@/features/channels/api";
import { cn } from "@/lib/utils";

export interface ChannelRowProps {
  channel: YoutubeChannel;
  /** Texto del botón de suscripción (`site.youtube.subscribeLabel`). */
  subscribeLabel: string;
  /** El embed está abierto en esta fila (solo una a la vez en la lista). */
  expanded?: boolean;
  /** Abre/cierra el embed. Si no se pasa, la fila ofrece «Ver canal» (enlace externo). */
  onToggle?: () => void;
  /** Prioriza la carga del avatar (primeras filas sobre el pliegue). */
  priority?: boolean;
  className?: string;
}

/** Rojo de YouTube (#d90000: 5,3:1 con texto claro) solo en el botón Suscribirse. */
const subscribeClass = "bg-[#d90000] text-text-1 shadow-none hover:bg-[#ff1a1a]";

/**
 * Fila de canal (`ListRow` dentro de un `<article>`): avatar 56, nombre, handle en mono, categoría como
 * badge, descripción truncada, «Suscribirse» (rojo) y «Ver videos», que despliega el embed lazy de
 * YouTube bajo la fila. El iframe solo se monta al expandir.
 */
export function ChannelRow({ channel, subscribeLabel, expanded = false, onToggle, priority = false, className }: ChannelRowProps) {
  const src = channelEmbedSrc(channel);
  const canExpand = Boolean(src && onToggle);
  const isOpen = canExpand && expanded;
  const hue = stringToHue(channel.name);
  const titleId = `channel-${channel.id}-title`;

  return (
    <article aria-labelledby={titleId} className={cn("border-b border-line-1", channel.featured && "bg-ink-2", className)}>
      <ListRow
        as="div"
        active={isOpen}
        /* < sm: la celda de acciones pasa a una segunda fila a todo el ancho (el texto no se estruja). */
        className="border-b-0 px-3 py-4 max-sm:grid-cols-[auto_1fr] max-sm:[&>div:last-child]:col-span-2 max-sm:[&>div:last-child]:mt-3 sm:px-4"
        media={<Avatar name={channel.name} src={channel.avatarUrl ? resolveMediaUrl(channel.avatarUrl) : null} size={56} />}
        title={<span id={titleId}>{channel.name}</span>}
        meta={
          <>
            {channel.handle ? <span className="font-mono text-label text-text-3 normal-case">@{channel.handle}</span> : null}
            <Badge tone="neutral" variant="outline">
              {channel.category}
            </Badge>
            {channel.featured ? <Badge tone="gold">Destacado</Badge> : null}
            {channel.description ? (
              <Text as="span" size="body-sm" tone="2" className="basis-full line-clamp-2">
                {channel.description}
              </Text>
            ) : null}
          </>
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" className={subscribeClass}>
              <a href={subscribeUrl(channel.url)} target="_blank" rel="noopener noreferrer" aria-label={`${subscribeLabel}: ${channel.name} en YouTube`}>
                <Youtube aria-hidden />
                {subscribeLabel}
              </a>
            </Button>
            {canExpand ? (
              <Button type="button" variant="outline" size="sm" onClick={onToggle} aria-expanded={isOpen}>
                {isOpen ? <X aria-hidden /> : <Play aria-hidden />}
                {isOpen ? "Cerrar" : "Ver videos"}
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <a href={channel.url} target="_blank" rel="noopener noreferrer">
                  Ver canal
                </a>
              </Button>
            )}
          </div>
        }
      />
      {isOpen && src ? (
        <div className="px-3 pb-5 sm:px-4 lg:pl-[88px]">
          <YoutubeLazyEmbed
            src={src}
            title={`Videos de ${channel.name} en YouTube`}
            className="border-line-1"
            posterStyle={{ background: `linear-gradient(135deg, hsl(${hue}, 60%, 14%) 0%, hsl(${(hue + 40) % 360}, 45%, 6%) 100%)` }}
          />
        </div>
      ) : null}
    </article>
  );
}
