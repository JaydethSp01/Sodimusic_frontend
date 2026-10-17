"use client";

import { useState } from "react";
import type { YoutubeChannel } from "@/types/models";
import { HomeStagger, HomeStaggerItem } from "@/components/landing/home-page-motion";
import { ChannelCard, type ChannelCardVariant } from "@/features/channels/components/channel-card";
import { cn } from "@/lib/utils";

interface ChannelsGridProps {
  channels: YoutubeChannel[];
  subscribeLabel: string;
  variant?: ChannelCardVariant;
  className?: string;
}

/**
 * Grilla de tarjetas con UN solo embed abierto a la vez: abrir otro cierra el
 * anterior, así nunca hay más de un iframe de YouTube montado por página.
 */
export function ChannelsGrid({ channels, subscribeLabel, variant = "grid", className }: ChannelsGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const single = channels.length === 1;

  return (
    <HomeStagger
      className={cn(
        "grid gap-5 sm:gap-6",
        single ? "mx-auto max-w-xl" : "sm:grid-cols-2",
        channels.length > 2 && (variant === "home" ? "xl:grid-cols-3" : "lg:grid-cols-3 2xl:grid-cols-4"),
        className,
      )}
    >
      {channels.map((ch, i) => (
        <HomeStaggerItem key={ch.id} className="h-full">
          <ChannelCard
            channel={ch}
            variant={variant}
            subscribeLabel={subscribeLabel}
            expanded={activeId === ch.id}
            onToggle={() => setActiveId((cur) => (cur === ch.id ? null : ch.id))}
            priority={i < 3}
          />
        </HomeStaggerItem>
      ))}
    </HomeStagger>
  );
}
