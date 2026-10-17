import {
  AudioWaveform,
  Clapperboard,
  Handshake,
  KeyboardMusic,
  MessageCircle,
  Mic,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

/** Icono Lucide por `type` de servicio (`site.booking.services[].type`). */
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  VOCAL_RECORDING: Mic,
  BEAT_PRODUCTION: KeyboardMusic,
  COPRODUCTION: Handshake,
  MIX_MASTER: SlidersHorizontal,
  AUDIOVISUAL_PRODUCTION: Clapperboard,
  CONSULTING: MessageCircle,
};

export function serviceIcon(type: string | null | undefined): LucideIcon {
  return (type && SERVICE_ICONS[type]) || AudioWaveform;
}
