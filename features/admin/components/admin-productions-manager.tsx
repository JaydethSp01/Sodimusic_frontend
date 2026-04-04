"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { Production } from "@/types/models";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { uploadAdminFile } from "@/app/actions/admin-upload";
import { createProductionAction, deleteProductionAction, patchProductionAction } from "@/app/actions/admin-productions-actions";

type ProductionDraft = {
  title: string;
  artistName: string;
  artistCity: string;
  artistCountry: string;
  year: number;
  genre: string;
  coverUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  featured: boolean;
};

function normalizeMaybeUrl(v: string): string | null {
  const s = v.trim();
  return s.length ? s : null;
}

const emptyDraft = (): ProductionDraft => ({
  title: "",
  artistName: "",
  artistCity: "",
  artistCountry: "Colombia",
  year: new Date().getFullYear(),
  genre: "",
  coverUrl: null,
  spotifyUrl: null,
  youtubeUrl: null,
  featured: false,
});

export function AdminProductionsManager({ initialItems }: { initialItems: Production[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductionDraft>(() => emptyDraft());
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const coverPreview = useMemo(() => (draft.coverUrl ? resolveMediaUrl(draft.coverUrl) : null), [draft.coverUrl]);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setDraft(emptyDraft());
    setOpen(true);
  }

  function openEdit(row: Production) {
    setMode("edit");
    setEditingId(row.id);
    setDraft({
      title: row.title,
      artistName: row.artistName,
      artistCity: row.artistCity,
      artistCountry: row.artistCountry,
      year: row.year,
      genre: row.genre,
      coverUrl: row.coverUrl,
      spotifyUrl: row.spotifyUrl,
      youtubeUrl: row.youtubeUrl,
      featured: row.featured,
    });
    setOpen(true);
  }

  async function onSave() {
    if (saving) return;
    if (!draft.title.trim() || !draft.artistName.trim() || !draft.artistCity.trim() || !draft.artistCountry.trim() || !draft.genre.trim() || !Number.isFinite(draft.year)) {
      toast.error("Completa campos requeridos (título, artista, ciudad, país, año y género)");
      return;
    }
    setSaving(true);
    try {
      if (mode === "create") {
        const r = await createProductionAction({ ...draft });
        if (!r.ok) {
          toast.error(r.error ?? "Error al crear producción");
          return;
        }
      } else if (mode === "edit" && editingId) {
        const r = await patchProductionAction(editingId, { ...draft });
        if (!r.ok) {
          toast.error(r.error ?? "Error al editar producción");
          return;
        }
      }
      toast.success(mode === "create" ? "Producción creada" : "Producción actualizada");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(row: Production) {
    const ok = window.confirm(`¿Borrar "${row.title}"?`);
    if (!ok) return;
    const r = await deleteProductionAction(row.id);
    if (!r.ok) {
      toast.error(r.error ?? "Error al borrar");
      return;
    }
    toast.success("Producción borrada");
    router.refresh();
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

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="font-display text-xl">Producciones</CardTitle>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Administra portafolio: portada, links y destacado.</p>
        </div>
        <Button type="button" onClick={openCreate}>
          Nueva producción
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Artista</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Género</TableHead>
                <TableHead>Destacado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialItems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.artistName}</TableCell>
                  <TableCell className="font-mono text-xs">{p.year}</TableCell>
                  <TableCell>{p.genre}</TableCell>
                  <TableCell>{p.featured ? "Sí" : "No"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => openEdit(p)}>
                        Editar
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => void onDelete(p)}>
                        Borrar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {initialItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-[var(--text-muted)]">
                    No hay producciones todavía.
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
            <DialogTitle>{mode === "create" ? "Crear producción" : "Editar producción"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Field label="Título">
                <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
              </Field>
              <Field label="Artista">
                <Input value={draft.artistName} onChange={(e) => setDraft((p) => ({ ...p, artistName: e.target.value }))} />
              </Field>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Ciudad">
                  <Input value={draft.artistCity} onChange={(e) => setDraft((p) => ({ ...p, artistCity: e.target.value }))} />
                </Field>
                <Field label="País">
                  <Input value={draft.artistCountry} onChange={(e) => setDraft((p) => ({ ...p, artistCountry: e.target.value }))} />
                </Field>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Año">
                  <Input type="number" value={draft.year} onChange={(e) => setDraft((p) => ({ ...p, year: Number(e.target.value) || new Date().getFullYear() }))} />
                </Field>
                <Field label="Género">
                  <Input value={draft.genre} onChange={(e) => setDraft((p) => ({ ...p, genre: e.target.value }))} />
                </Field>
              </div>
              <Field label="Destacado">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={draft.featured} onCheckedChange={(v) => setDraft((p) => ({ ...p, featured: v === true }))} />
                  Mostrar en home
                </label>
              </Field>
            </div>

            <div className="space-y-4">
              <Field label="Portada (coverUrl)">
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
              <Field label="Spotify URL (opcional)">
                <Input value={draft.spotifyUrl ?? ""} onChange={(e) => setDraft((p) => ({ ...p, spotifyUrl: normalizeMaybeUrl(e.target.value) }))} />
              </Field>
              <Field label="YouTube URL (opcional)">
                <Input value={draft.youtubeUrl ?? ""} onChange={(e) => setDraft((p) => ({ ...p, youtubeUrl: normalizeMaybeUrl(e.target.value) }))} />
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

