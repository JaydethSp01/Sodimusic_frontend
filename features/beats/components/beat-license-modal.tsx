"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Beat, BeatLicenseType } from "@/types/models";
import { beatLicenses } from "@/features/beats/licenses";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heading } from "@/components/ui/heading";
import { Price } from "@/components/ui/price";
import { Text } from "@/components/ui/text";

interface BeatLicenseModalProps {
  beat: Beat;
  ivaIncluded: boolean;
  onClose: () => void;
  onChoose: (type: BeatLicenseType) => void;
}

/** Modal "Elegir licencia": lista MP3/WAV/Stems/Exclusiva (las filas sin precio se ocultan). */
export function BeatLicenseModal({ beat, ivaIncluded, onClose, onChoose }: BeatLicenseModalProps) {
  const licenses = beatLicenses(beat);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-line-1 bg-ink-2 p-6 sm:max-w-xl sm:p-8">
        <DialogHeader className="text-left">
          <DialogTitle asChild>
            <Heading as="h2" size="display-sm">
              Elegir licencia
            </Heading>
          </DialogTitle>
          <DialogDescription asChild>
            <Text size="body-sm" tone="2" className="mt-2">
              {beat.title}
              {beat.bpm ? ` · ${beat.bpm} BPM` : ""} · {beat.genre}. Precios en COP{ivaIncluded ? ", IVA incluido" : ""}.
            </Text>
          </DialogDescription>
        </DialogHeader>
        {licenses.length ? (
          <ul className="mt-2 border-t border-line-1" aria-label="Licencias disponibles">
            {licenses.map((l, i) => (
              <li key={l.type}>
                <button
                  type="button"
                  onClick={() => onChoose(l.type)}
                  className="group grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-start gap-x-4 border-b border-line-1 py-4 text-left transition-colors duration-150 hover:bg-fire-500/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fire-500"
                >
                  <span aria-hidden className="text-accent w-8 pt-0.5 text-display-sm leading-none text-fire-500/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-title text-text-1">{l.label}</span>
                      {l.type === "EXCLUSIVE" ? <Badge tone="gold">Se retira del catálogo</Badge> : null}
                    </span>
                    <Text as="span" size="body-sm" tone="2" className="mt-1 block">
                      {l.summary}
                    </Text>
                  </span>
                  <span className="flex flex-col items-end gap-2 pt-0.5">
                    <Price amount={l.priceCOP} size="sm" tone="fire" />
                    <ArrowRight
                      className="h-5 w-5 text-text-3 transition-[transform,color] duration-150 ease-out group-hover:translate-x-1 group-hover:text-fire-400 motion-reduce:transform-none"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <Text size="body-sm" tone="2" className="rounded-lg border border-dashed border-line-2 px-4 py-6 text-center">
            Este beat aún no tiene precios publicados. Escríbenos y te cotizamos.
          </Text>
        )}
        <Text size="body-sm" tone="3">
          Elige una licencia y te contactamos para cerrar la compra. Condiciones completas en la{" "}
          <Link href="/legal/licencia-beats" target="_blank" className="link-sweep text-fire-400">
            Licencia de beats
          </Link>
          .
        </Text>
      </DialogContent>
    </Dialog>
  );
}
