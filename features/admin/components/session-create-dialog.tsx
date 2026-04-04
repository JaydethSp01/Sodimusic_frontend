"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBookingSessionAdmin } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SERVICE_TYPE_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import { Plus } from "lucide-react";

const SERVICE_KEYS = [
  "VOCAL_RECORDING",
  "BEAT_PRODUCTION",
  "COPRODUCTION",
  "MIX_MASTER",
  "AUDIOVISUAL_PRODUCTION",
  "CONSULTING",
] as const satisfies readonly (keyof typeof SERVICE_TYPE_LABELS)[];

export function SessionCreateDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serviceType, setServiceType] = useState<string>(SERVICE_KEYS[0]);
  const [artistName, setArtistName] = useState("");
  const [artistEmail, setArtistEmail] = useState("");
  const [artistPhone, setArtistPhone] = useState("");
  const [artistInstagram, setArtistInstagram] = useState("");
  const [musicReference, setMusicReference] = useState("");
  const [vision, setVision] = useState("");
  const [genres, setGenres] = useState("Trap");
  const [scheduledDate, setScheduledDate] = useState(() => formatDateInput(new Date()));
  const [timeSlot, setTimeSlot] = useState<"morning" | "afternoon" | "night">("morning");
  const [internalNotes, setInternalNotes] = useState("");

  function reset() {
    setArtistName("");
    setArtistEmail("");
    setArtistPhone("");
    setArtistInstagram("");
    setMusicReference("");
    setVision("");
    setGenres("Trap");
    setScheduledDate(formatDateInput(new Date()));
    setTimeSlot("morning");
    setInternalNotes("");
    setServiceType(SERVICE_KEYS[0]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await createBookingSessionAdmin({
        serviceType,
        artistName: artistName.trim(),
        artistEmail: artistEmail.trim(),
        artistPhone: artistPhone.trim(),
        artistInstagram: artistInstagram.trim() || null,
        musicReference: musicReference.trim(),
        vision: vision.trim() || null,
        genres: genres.trim(),
        scheduledDate,
        timeSlot,
        internalNotes: internalNotes.trim() || null,
        isFirstTime: true,
      });
      if (!r.ok) {
        toast.error(r.error ?? "Error al crear");
        return;
      }
      toast.success("Sesión creada");
      setOpen(false);
      reset();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva sesión
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-background-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Crear sesión manual</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4 text-sm">
          <div className="space-y-2">
            <Label>Servicio</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger className="border-white/10 bg-black/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {SERVICE_TYPE_LABELS[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sess-artist">Nombre artístico</Label>
              <Input
                id="sess-artist"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                required
                className="border-white/10 bg-black/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sess-email">Email</Label>
              <Input
                id="sess-email"
                type="email"
                value={artistEmail}
                onChange={(e) => setArtistEmail(e.target.value)}
                required
                className="border-white/10 bg-black/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sess-phone">Teléfono</Label>
              <Input
                id="sess-phone"
                value={artistPhone}
                onChange={(e) => setArtistPhone(e.target.value)}
                required
                placeholder="+57…"
                className="border-white/10 bg-black/30"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="sess-ig">Instagram (opcional)</Label>
              <Input
                id="sess-ig"
                value={artistInstagram}
                onChange={(e) => setArtistInstagram(e.target.value)}
                placeholder="@usuario"
                className="border-white/10 bg-black/30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sess-ref">Referencia musical (URL)</Label>
            <Input
              id="sess-ref"
              type="url"
              value={musicReference}
              onChange={(e) => setMusicReference(e.target.value)}
              required
              placeholder="https://open.spotify.com/…"
              className="border-white/10 bg-black/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sess-genres">Géneros (texto)</Label>
            <Input
              id="sess-genres"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              required
              className="border-white/10 bg-black/30"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sess-vision">Visión / notas del artista (opcional)</Label>
            <Textarea
              id="sess-vision"
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              rows={2}
              className="resize-none border-white/10 bg-black/30"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sess-date">Fecha</Label>
              <Input
                id="sess-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="border-white/10 bg-black/30"
              />
            </div>
            <div className="space-y-2">
              <Label>Franja</Label>
              <Select value={timeSlot} onValueChange={(v) => setTimeSlot(v as typeof timeSlot)}>
                <SelectTrigger className="border-white/10 bg-black/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Mañana (9–12)</SelectItem>
                  <SelectItem value="afternoon">Tarde (14–18)</SelectItem>
                  <SelectItem value="night">Noche (19–22)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sess-internal">Notas internas (opcional)</Label>
            <Textarea
              id="sess-internal"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={2}
              className="resize-none border-white/10 bg-black/30"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando…" : "Crear sesión"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
