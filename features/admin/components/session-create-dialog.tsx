"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createBookingSessionAdmin } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AdminDialogFooter, AdminField, adminDialogClass } from "@/features/admin/components/admin-primitives";
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
        <Button type="button" size="sm">
          <Plus aria-hidden />
          Nueva sesión
        </Button>
      </DialogTrigger>
      <DialogContent className={`${adminDialogClass} sm:max-w-lg`}>
        <DialogHeader>
          <DialogTitle className="text-title">Crear sesión manual</DialogTitle>
          <DialogDescription>Alta directa sin pasar por el booking público. La franja debe estar libre.</DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sess-service">Servicio</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger id="sess-service">
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
            <AdminField label="Nombre artístico" htmlFor="sess-artist" className="sm:col-span-2">
              <Input id="sess-artist" value={artistName} onChange={(e) => setArtistName(e.target.value)} required />
            </AdminField>
            <AdminField label="Email" htmlFor="sess-email">
              <Input id="sess-email" type="email" value={artistEmail} onChange={(e) => setArtistEmail(e.target.value)} required />
            </AdminField>
            <AdminField label="Teléfono" htmlFor="sess-phone">
              <Input id="sess-phone" value={artistPhone} onChange={(e) => setArtistPhone(e.target.value)} required placeholder="+57…" />
            </AdminField>
            <AdminField label="Instagram (opcional)" htmlFor="sess-ig" className="sm:col-span-2">
              <Input id="sess-ig" value={artistInstagram} onChange={(e) => setArtistInstagram(e.target.value)} placeholder="@usuario" />
            </AdminField>
          </div>
          <AdminField label="Referencia musical (URL)" htmlFor="sess-ref">
            <Input id="sess-ref" type="url" value={musicReference} onChange={(e) => setMusicReference(e.target.value)} required placeholder="https://open.spotify.com/…" />
          </AdminField>
          <AdminField label="Géneros (texto)" htmlFor="sess-genres">
            <Input id="sess-genres" value={genres} onChange={(e) => setGenres(e.target.value)} required />
          </AdminField>
          <AdminField label="Visión / notas del artista (opcional)" htmlFor="sess-vision">
            <Textarea id="sess-vision" value={vision} onChange={(e) => setVision(e.target.value)} rows={2} className="min-h-[72px] resize-none" />
          </AdminField>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Fecha" htmlFor="sess-date">
              <Input id="sess-date" type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} required />
            </AdminField>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sess-slot">Franja</Label>
              <Select value={timeSlot} onValueChange={(v) => setTimeSlot(v as typeof timeSlot)}>
                <SelectTrigger id="sess-slot">
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
          <AdminField label="Notas internas (opcional)" htmlFor="sess-internal">
            <Textarea id="sess-internal" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={2} className="min-h-[72px] resize-none" />
          </AdminField>
          <AdminDialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {loading ? "Creando…" : "Crear sesión"}
            </Button>
          </AdminDialogFooter>
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
