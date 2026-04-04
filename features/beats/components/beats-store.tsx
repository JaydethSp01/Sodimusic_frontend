"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Beat } from "@/types/models";
import { beatInterestSchema, type BeatInterestInput } from "@/features/beats/schemas/beat-interest-schema";
import { GenreTag } from "@/components/shared/genre-tag";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPublicApiUrl } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { toast } from "sonner";
import { GENRE_FILTER_VALUES } from "@/lib/constants";
import { PlaceholderCover } from "@/components/shared/placeholder-cover";
import { BeatAudioPlayer } from "@/features/beats/components/beat-audio-player";

export function BeatsStore({ initialItems }: { initialItems: Beat[] }) {
  const [genre, setGenre] = useState<string>("Todos");
  const [bpmMin, setBpmMin] = useState(60);
  const [bpmMax, setBpmMax] = useState(200);
  const [mood, setMood] = useState("Todos");
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [modalBeat, setModalBeat] = useState<Beat | null>(null);

  const moods = useMemo(() => {
    const s = new Set<string>();
    for (const b of initialItems) {
      if (b.mood) {
        s.add(b.mood);
      }
    }
    return ["Todos", ...Array.from(s).sort()];
  }, [initialItems]);

  const filtered = useMemo(() => {
    return initialItems.filter((b) => {
      if (genre !== "Todos" && b.genre !== genre) {
        return false;
      }
      if (onlyAvail && b.status !== "AVAILABLE") {
        return false;
      }
      if (mood !== "Todos" && b.mood !== mood) {
        return false;
      }
      if (b.bpm != null && (b.bpm < bpmMin || b.bpm > bpmMax)) {
        return false;
      }
      return true;
    });
  }, [initialItems, genre, bpmMin, bpmMax, mood, onlyAvail]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8 grid gap-4 rounded-lg border border-border bg-background-card p-4 md:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="min-w-0">
          <Label>Género</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background-secondary px-3 text-sm"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            aria-label="Filtrar por género"
          >
            <option>Todos</option>
            {GENRE_FILTER_VALUES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <div>
            <Label htmlFor="bpm-min">BPM mín</Label>
            <Input
              id="bpm-min"
              type="number"
              className="mt-1 w-full min-w-[96px]"
              value={bpmMin}
              min={60}
              max={200}
              onChange={(e) => setBpmMin(Number(e.target.value) || 60)}
            />
          </div>
          <div>
            <Label htmlFor="bpm-max">BPM máx</Label>
            <Input
              id="bpm-max"
              type="number"
              className="mt-1 w-full min-w-[96px]"
              value={bpmMax}
              min={60}
              max={200}
              onChange={(e) => setBpmMax(Number(e.target.value) || 200)}
            />
          </div>
        </div>
        <div className="min-w-0">
          <Label>Mood</Label>
          <select
            className="mt-1 flex h-10 w-full rounded-md border border-border bg-background-secondary px-3 text-sm"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            aria-label="Filtrar por mood"
          >
            {moods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm lg:justify-self-start">
          <input type="checkbox" checked={onlyAvail} onChange={(e) => setOnlyAvail(e.target.checked)} aria-label="Solo beats disponibles" />
          Solo disponibles
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((beat) => (
          <BeatCard key={beat.id} beat={beat} onInterest={() => setModalBeat(beat)} />
        ))}
      </div>

      {modalBeat ? <InterestModal beat={modalBeat} onClose={() => setModalBeat(null)} /> : null}
    </div>
  );
}

function BeatCard({ beat, onInterest }: { beat: Beat; onInterest: () => void }) {
  const sold = beat.status === "SOLD";
  const exclusive = beat.status === "EXCLUSIVE" || beat.exclusive;
  return (
    <Card className={sold ? "overflow-hidden opacity-50" : "overflow-hidden"}>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-card">
        <PlaceholderCover
          seed={beat.title}
          label={beat.title.slice(0, 2).toUpperCase()}
          className="absolute inset-0"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-body text-lg font-semibold">{beat.title}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <GenreTag genre={beat.genre} />
          {beat.bpm ? <span className="font-mono text-xs text-[var(--text-muted)]">{beat.bpm} BPM</span> : null}
          {beat.mood ? (
            <Badge variant="secondary" className="font-mono text-[10px]">
              {beat.mood}
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 font-mono text-lg text-primary">
          $ {beat.priceCOP.toLocaleString("es-CO")} COP
        </p>
        <div className="mt-2">
          {sold ? (
            <Badge variant="outline" className="line-through decoration-2 opacity-80">
              Vendido
            </Badge>
          ) : exclusive ? (
            <Badge className="bg-gold-muted text-[var(--gold)]">Exclusivo</Badge>
          ) : (
            <Badge className="bg-green-950 text-green-400">Disponible</Badge>
          )}
        </div>
        {beat.audioUrl ? (
          <BeatAudioPlayer src={resolveMediaUrl(beat.audioUrl)} title={beat.title} />
        ) : null}
        <Button
          type="button"
          className="mt-4 w-full data-[disabled]:cursor-not-allowed"
          disabled={sold}
          onClick={onInterest}
          aria-label={`Me interesa en ${beat.title}`}
        >
          Me interesa
        </Button>
      </CardContent>
    </Card>
  );
}

function InterestModal({ beat, onClose }: { beat: Beat; onClose: () => void }) {
  const form = useForm<BeatInterestInput>({
    resolver: zodResolver(beatInterestSchema),
    defaultValues: {
      beatId: beat.id,
      artistName: "",
      email: "",
      phone: "",
      exclusiveIntent: false,
      instagram: "",
      message: "",
    },
  });

  async function onSubmit(values: BeatInterestInput) {
    const res = await fetch(`${getPublicApiUrl()}/api/contact/beat-interest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await res.json()) as { success?: boolean; error?: string };
    if (!res.ok || !data.success) {
      toast.error(data.error ?? "No se pudo enviar");
      return;
    }
    toast.success("¡Listo! Revisa tu correo.");
    onClose();
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Me interesa: {beat.title}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((v) => void onSubmit(v))}
        >
          <input type="hidden" {...form.register("beatId")} />
          <div>
            <Label htmlFor="bi-name">Nombre artístico</Label>
            <Input id="bi-name" {...form.register("artistName")} />
            {form.formState.errors.artistName ? (
              <p className="text-xs text-red-500">{form.formState.errors.artistName.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="bi-email">Email</Label>
            <Input id="bi-email" type="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="bi-phone">WhatsApp</Label>
            <Input id="bi-phone" placeholder="+57 321 5368590" {...form.register("phone")} />
            {form.formState.errors.phone ? (
              <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="bi-ig">Instagram (opcional)</Label>
            <Input id="bi-ig" {...form.register("instagram")} />
          </div>
          <div>
            <p className="text-sm font-medium">Tipo</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                variant={!form.watch("exclusiveIntent") ? "default" : "outline"}
                onClick={() => form.setValue("exclusiveIntent", false)}
              >
                Uso no exclusivo
              </Button>
              <Button
                type="button"
                variant={form.watch("exclusiveIntent") ? "default" : "outline"}
                onClick={() => form.setValue("exclusiveIntent", true)}
              >
                Compra exclusiva
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="bi-msg">Mensaje (opcional)</Label>
            <Textarea id="bi-msg" {...form.register("message")} />
          </div>
          <Button type="submit">Enviar</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
