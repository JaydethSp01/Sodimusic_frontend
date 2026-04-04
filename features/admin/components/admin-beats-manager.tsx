"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { Beat } from "@/types/models";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { uploadAdminFile } from "@/app/actions/admin-upload";
import { createBeatAction, deleteBeatAction, patchBeatAction } from "@/app/actions/admin-beats-actions";
import { BeatAudioPlayer } from "@/features/beats/components/beat-audio-player";

type Status = "AVAILABLE" | "SOLD" | "EXCLUSIVE";

type BeatDraft = {
  title: string;
  genre: string;
  bpm: number | null;
  mood: string | null;
  priceCOP: number;
  status: Status;
  audioUrl: string | null;
  coverUrl: string | null;
  exclusive: boolean;
};

function normalizeMaybeUrl(v: string): string | null {
  const s = v.trim();
  return s.length ? s : null;
}

const emptyDraft = (): BeatDraft => ({
  title: "",
  genre: "",
  bpm: null,
  mood: null,
  priceCOP: 0,
  status: "AVAILABLE",
  audioUrl: null,
  coverUrl: null,
  exclusive: false,
});

export function AdminBeatsManager({ initialItems }: { initialItems: Beat[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BeatDraft>(() => emptyDraft());
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Beat | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const coverPreview = useMemo(() => (draft.coverUrl ? resolveMediaUrl(draft.coverUrl) : null), [draft.coverUrl]);
  const audioPreview = useMemo(() => (draft.audioUrl ? resolveMediaUrl(draft.audioUrl) : null), [draft.audioUrl]);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setDraft(emptyDraft());
    setOpen(true);
  }

  function openEdit(row: Beat) {
    setMode("edit");
    setEditingId(row.id);
    setDraft({
      title: row.title,
      genre: row.genre,
      bpm: row.bpm ?? null,
      mood: row.mood ?? null,
      priceCOP: row.priceCOP,
      status: row.status as Status,
      audioUrl: row.audioUrl,
      coverUrl: row.coverUrl,
      exclusive: row.exclusive,
    });
    setOpen(true);
  }

  async function onSave() {
    if (saving) return;
    if (!draft.title.trim() || !draft.genre.trim() || !Number.isFinite(draft.priceCOP) || draft.priceCOP <= 0) {
      toast.error("Completa título, género y precio COP (> 0)");
      return;
    }
    setSaving(true);
    try {
      if (mode === "create") {
        const r = await createBeatAction({
          title: draft.title,
          genre: draft.genre,
          bpm: draft.bpm,
          mood: draft.mood,
          priceCOP: draft.priceCOP,
          status: draft.status,
          audioUrl: draft.audioUrl,
          coverUrl: draft.coverUrl,
          exclusive: draft.exclusive,
        });
        if (!r.ok) {
          toast.error(r.error ?? "Error al crear beat");
          return;
        }
      } else if (mode === "edit" && editingId) {
        const r = await patchBeatAction(editingId, {
          title: draft.title,
          genre: draft.genre,
          bpm: draft.bpm,
          mood: draft.mood,
          priceCOP: draft.priceCOP,
          status: draft.status,
          audioUrl: draft.audioUrl,
          coverUrl: draft.coverUrl,
          exclusive: draft.exclusive,
        });
        if (!r.ok) {
          toast.error(r.error ?? "Error al editar beat");
          return;
        }
      }
      toast.success(mode === "create" ? "Beat creado" : "Beat actualizado");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteBeat() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteBeatAction(deleteTarget.id);
      if (!r.ok) {
        toast.error(r.error ?? "Error al borrar");
        return;
      }
      toast.success("Beat borrado");
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleteBusy(false);
    }
  }

  async function onUploadCover(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await uploadAdminFile(fd);
      if (!r.ok || !r.url) {
        toast.error(r.error ?? "Error al subir portada");
        return;
      }
      setDraft((p) => ({ ...p, coverUrl: r.url ?? null }));
      toast.success("Portada subida");
    } finally {
      setUploadingCover(false);
    }
  }

  async function onUploadAudio(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setUploadingAudio(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await uploadAdminFile(fd);
      if (!r.ok || !r.url) {
        toast.error(r.error ?? "Error al subir audio");
        return;
      }
      setDraft((p) => ({ ...p, audioUrl: r.url ?? null }));
      toast.success("Audio subido");
    } finally {
      setUploadingAudio(false);
    }
  }

  return (
    <>
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="font-display text-xl">Beats</CardTitle>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Administra estado, precio, cover y audio.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          Nuevo beat
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>BPM</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialItems.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.title}</TableCell>
                  <TableCell>{b.genre}</TableCell>
                  <TableCell className="font-mono text-xs">{b.bpm ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{b.priceCOP.toLocaleString("es-CO")} COP</TableCell>
                  <TableCell>{b.status}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => openEdit(b)}>
                        Editar
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setDeleteTarget(b)}>
                        Borrar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {initialItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-[var(--text-muted)]">
                    No hay beats todavía.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Crear beat" : "Editar beat"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Field label="Título">
                <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
              </Field>
              <Field label="Género">
                <Input value={draft.genre} onChange={(e) => setDraft((p) => ({ ...p, genre: e.target.value }))} />
              </Field>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="BPM (opcional)">
                  <Input
                    type="number"
                    value={draft.bpm ?? ""}
                    onChange={(e) => setDraft((p) => ({ ...p, bpm: e.target.value === "" ? null : Number(e.target.value) }))}
                  />
                </Field>
                <Field label="Precio COP">
                  <Input type="number" value={draft.priceCOP} onChange={(e) => setDraft((p) => ({ ...p, priceCOP: Number(e.target.value) || 0 }))} />
                </Field>
              </div>
              <Field label="Mood (opcional)">
                <Input value={draft.mood ?? ""} onChange={(e) => setDraft((p) => ({ ...p, mood: e.target.value.trim().length ? e.target.value : null }))} />
              </Field>

              <Field label="Estado">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={draft.status}
                  onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as Status }))}
                >
                  <option value="AVAILABLE">Disponible (AVAILABLE)</option>
                  <option value="SOLD">Vendido (SOLD)</option>
                  <option value="EXCLUSIVE">Exclusivo (EXCLUSIVE)</option>
                </select>
              </Field>

              <Field label="Exclusivo">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={draft.exclusive} onCheckedChange={(v) => setDraft((p) => ({ ...p, exclusive: v === true }))} />
                  Beat exclusivo
                </label>
              </Field>
            </div>

            <div className="space-y-4">
              <Field label="Cover (image)">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="preview cover" className="mb-3 h-28 w-full rounded-lg border border-border object-cover" />
                ) : (
                  <div className="mb-3 h-28 w-full rounded-lg border border-border bg-background-secondary" />
                )}
                <Input value={draft.coverUrl ?? ""} onChange={(e) => setDraft((p) => ({ ...p, coverUrl: normalizeMaybeUrl(e.target.value) }))} />
                <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={onUploadCover} />
                {uploadingCover ? <p className="mt-1 text-xs text-primary">Subiendo...</p> : null}
              </Field>

              <Field label="Audio (mp3/wav)">
                {audioPreview ? (
                  <div className="mb-3 rounded-lg border border-border bg-background-secondary p-3">
                    <BeatAudioPlayer src={audioPreview} title={draft.title || "Beat"} />
                  </div>
                ) : (
                  <div className="mb-3 h-20 w-full rounded-lg border border-border bg-background-secondary" />
                )}
                <Input value={draft.audioUrl ?? ""} onChange={(e) => setDraft((p) => ({ ...p, audioUrl: normalizeMaybeUrl(e.target.value) }))} />
                <input type="file" accept="audio/mpeg,audio/wav" className="mt-2 block w-full text-sm" onChange={onUploadAudio} />
                {uploadingAudio ? <p className="mt-1 text-xs text-primary">Subiendo...</p> : null}
              </Field>

              <div className="flex flex-wrap gap-2 pt-2 md:justify-end">
                <Button type="button" variant="outline" disabled={saving} onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" disabled={saving} onClick={() => void onSave()}>
                  {saving ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-background-card">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar este beat?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{deleteTarget?.title ?? ""}». Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteBusy}
              onClick={() => void confirmDeleteBeat()}
            >
              {deleteBusy ? "Borrando…" : "Borrar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-[var(--text-secondary)]">{label}</Label>
      {children}
    </div>
  );
}

