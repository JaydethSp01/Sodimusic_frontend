"use client";

import { useState } from "react";
import type { YoutubeChannel } from "@/types/models";
import { ChannelRow } from "@/features/channels/components/channel-row";
import { cn } from "@/lib/utils";

interface ChannelsListProps {
  channels: YoutubeChannel[];
  subscribeLabel: string;
  className?: string;
}

/**
 * Lista de `ChannelRow` con UN solo embed abierto a la vez: abrir otro cierra el anterior, así nunca
 * hay más de un iframe de YouTube montado por página. Los destacados van primero (fondo ink-2).
 */
export function ChannelsList({ channels, subscribeLabel, className }: ChannelsListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const ordered = [...channels].sort((a, b) => Number(b.featured) - Number(a.featured));

  return (
    <div className={cn("border-t border-line-1", className)}>
      {ordered.map((ch, i) => (
        <ChannelRow
          key={ch.id}
          channel={ch}
          subscribeLabel={subscribeLabel}
          expanded={activeId === ch.id}
          onToggle={() => setActiveId((cur) => (cur === ch.id ? null : ch.id))}
          priority={i < 3}
        />
      ))}
    </div>
  );
}
