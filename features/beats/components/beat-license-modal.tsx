"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Beat, BeatLicenseType } from "@/types/models";
import { beatLicenses } from "@/features/beats/licenses";
import { formatCOP } from "@/lib/format-cop";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BeatLicenseModalProps {
  beat: Beat;
  ivaIncluded: boolean;
  onClose: () => void;
  onChoose: (type: BeatLicenseType) => void;
}

/** Modal "Elegir licencia": tabla MP3/WAV/Stems/Exclusiva; filas sin precio se ocultan. */
export function BeatLicenseModal({ beat, ivaIncluded, onClose, onChoose }: BeatLicenseModalProps) {
  const licenses = beatLicenses(beat);
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-wide">Elegir licencia</DialogTitle>
          <DialogDescription>
            {beat.title}
            {beat.bpm ? ` · ${beat.bpm} BPM` : ""} · {beat.genre}. Precios en COP{ivaIncluded ? ", IVA incluido" : ""}.
          </DialogDescription>
        </DialogHeader>
        {licenses.length ? (
          <ul className="divide-y divide-border rounded-lg border border-border" aria-label="Licencias disponibles">
            {licenses.map((l) => (
              <li key={l.type}>
                <button
                  type="button"
                  onClick={() => onChoose(l.type)}
                  className="group flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-display text-xl tracking-wide text-foreground">{l.label}</span>
                      <span className="font-mono text-base text-primary">{formatCOP(l.priceCOP)}</span>
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-[var(--text-secondary)]">{l.summary}</span>
                  </span>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-primary motion-reduce:transition-none"
                    aria-hidden
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-[var(--text-secondary)]">
            Este beat aún no tiene precios publicados. Escríbenos y te cotizamos.
          </p>
        )}
        <p className="text-xs leading-relaxed text-[var(--text-muted)]">
          Elige una licencia y te contactamos para cerrar la compra. Condiciones completas en la{" "}
          <Link href="/legal/licencia-beats" target="_blank" className="text-primary underline underline-offset-2">
            Licencia de beats
          </Link>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}
