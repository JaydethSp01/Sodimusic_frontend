"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import type { Release } from "@/types/models";
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
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sparkles } from "lucide-react";
import { uploadAdminFile } from "@/app/actions/admin-upload";
import { createReleaseAction, deleteReleaseAction, patchReleaseAction } from "@/app/actions/admin-releases-actions";

type ReleaseDraft = {
  title: string;
  slug: string;
  artistName: string;
  genre: string;
  releaseYear: number;
  coverUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  appleUrl: string | null;
  deezerUrl: string | null;
  amazonUrl: string | null;
  tidalUrl: string | null;
  soundcloudUrl: string | null;
  /** YYYY-MM-DD (input date); se envía como ISO */
  releaseDate: string;
  description: string | null;
  featured: boolean;
  upcoming: boolean;
};

type SmartLinkKey = "spotifyUrl" | "youtubeUrl" | "appleUrl" | "deezerUrl" | "amazonUrl" | "tidalUrl" | "soundcloudUrl";

const SMART_LINKS: { key: SmartLinkKey; label: string; placeholder: string }[] = [
  { key: "spotifyUrl", label: "Spotify", placeholder: "https://open.spotify.com/…" },
  { key: "youtubeUrl", label: "YouTube", placeholder: "https://youtube.com/watch?v=…" },
  { key: "appleUrl", label: "Apple Music", placeholder: "https://music.apple.com/…" },
  { key: "deezerUrl", label: "Deezer", placeholder: "https://www.deezer.com/…" },
  { key: "amazonUrl", label: "Amazon Music", placeholder: "https://music.amazon.com/…" },
  { key: "tidalUrl", label: "Tidal", placeholder: "https://tidal.com/…" },
  { key: "soundcloudUrl", label: "SoundCloud", placeholder: "https://soundcloud.com/…" },
];

function normalizeMaybeUrl(v: string): string | null {
  const s = v.trim();
  return s.length ? s : null;
}

function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** ISO → YYYY-MM-DD para `<input type="date">` */
function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

/** YYYY-MM-DD → ISO (mediodía UTC para evitar saltos de día por zona horaria); "" borra la fecha */
function dateInputToIso(v: string): string {
  if (!v) return "";
  const d = new Date(`${v}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

const emptyDraft = (): ReleaseDraft => ({
  title: "",
  slug: "",
  artistName: "",
  genre: "",
  releaseYear: new Date().getFullYear(),
  coverUrl: null,
  spotifyUrl: null,
  youtubeUrl: null,
  appleUrl: null,
  deezerUrl: null,
  amazonUrl: null,
  tidalUrl: null,
  soundcloudUrl: null,
  releaseDate: "",
  description: null,
  featured: false,
  upcoming: true,
});

export function AdminReleasesManager({ initialItems }: { initialItems: Release[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  /** Slug al abrir el editor (para revalidar la URL antigua si cambia) */
  const [slugAtOpen, setSlugAtOpen] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReleaseDraft>(() => emptyDraft());
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Release | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const coverPreview = useMemo(() => (draft.coverUrl ? resolveMediaUrl(draft.coverUrl) : null), [draft.coverUrl]);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setSlugAtOpen(null);
    setDraft(emptyDraft());
    setOpen(true);
  }

  function openEdit(row: Release) {
    setMode("edit");
    setEditingId(row.id);
    setSlugAtOpen(row.slug);
    setDraft({
      title: row.title,
      slug: row.slug,
      artistName: row.artistName,
      genre: row.genre,
      releaseYear: row.releaseYear,
      coverUrl: row.coverUrl,
      spotifyUrl: row.spotifyUrl,
      youtubeUrl: row.youtubeUrl,
      appleUrl: row.appleUrl ?? null,
      deezerUrl: row.deezerUrl ?? null,
      amazonUrl: row.amazonUrl ?? null,
      tidalUrl: row.tidalUrl ?? null,
      soundcloudUrl: row.soundcloudUrl ?? null,
      releaseDate: isoToDateInput(row.releaseDate),
      description: row.description ?? null,
      featured: row.featured,
      upcoming: row.upcoming ?? true,
    });
    setOpen(true);
  }

  async function onSave() {
    if (saving) return;
    if (!draft.title.trim() || !draft.slug.trim() || !draft.artistName.trim() || !draft.genre.trim()) {
      toast.error("Completa título, slug, artista y género");
      return;
    }
    const badLink = SMART_LINKS.find((l) => draft[l.key] && !isHttpUrl(draft[l.key] as string));
    if (badLink) {
      toast.error(`El enlace de ${badLink.label} debe ser una URL válida (https://…)`);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...draft,
        releaseDate: dateInputToIso(draft.releaseDate),
      };
      if (mode === "create") {
        const r = await createReleaseAction({
          ...payload,
          coverUrl: draft.coverUrl,
          description: draft.description,
          upcoming: draft.upcoming,
          featured: draft.featured,
        });
        if (!r.ok) {
          toast.error(r.error ?? "Error al crear release");
          return;
        }
      } else if (mode === "edit" && editingId) {
        const r = await patchReleaseAction(
          editingId,
          {
            ...payload,
            coverUrl: draft.coverUrl,
            description: draft.description,
            upcoming: draft.upcoming,
            featured: draft.featured,
          },
          slugAtOpen ?? undefined,
        );
        if (!r.ok) {
          toast.error(r.error ?? "Error al editar release");
          return;
        }
      }
      toast.success(mode === "create" ? "Release creada" : "Release actualizada");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteRelease() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteReleaseAction(deleteTarget.id, deleteTarget.slug);
      if (!r.ok) {
        toast.error(r.error ?? "Error al borrar");
        return;
      }
      toast.success("Release borrada");
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

  return (
    <>
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <CardTitle className="font-display text-xl">Releases</CardTitle>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Crea, edita y administra destacados y próximos lanzamientos.
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          Nueva release
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Artista</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Destacado</TableHead>
                <TableHead>Próximo</TableHead>
                <TableHead className="w-[220px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialItems.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.title}</TableCell>
                  <TableCell className="font-mono text-xs">{r.slug}</TableCell>
                  <TableCell>{r.artistName}</TableCell>
                  <TableCell className="font-mono text-xs">{r.releaseYear}</TableCell>
                  <TableCell>{r.featured ? "Sí" : "No"}</TableCell>
                  <TableCell>{r.upcoming ? "Sí" : "No"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => openEdit(r)}>
                        Editar
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setDeleteTarget(r)}>
                        Borrar
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        className="hidden sm:inline-flex"
                      >
                        <a href={`/releases/${r.slug}`} target="_blank" rel="noopener noreferrer">
                          Preview
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {initialItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-[var(--text-muted)]">
                    No hay releases todavía.
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
            <DialogTitle>
              {mode === "create" ? "Crear release" : "Editar release"}{" "}
              <span className="ml-2 inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> {draft.upcoming ? "Próximo" : "Catálogo"}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Field label="Título">
                <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
              </Field>
              <Field label="Slug (único)">
                <Input value={draft.slug} onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))} />
              </Field>
              <Field label="Artista">
                <Input value={draft.artistName} onChange={(e) => setDraft((p) => ({ ...p, artistName: e.target.value }))} />
              </Field>
              <Field label="Género">
                <Input value={draft.genre} onChange={(e) => setDraft((p) => ({ ...p, genre: e.target.value }))} />
              </Field>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Año de release">
                  <Input
                    type="number"
                    value={draft.releaseYear}
                    onChange={(e) => setDraft((p) => ({ ...p, releaseYear: Number(e.target.value) || new Date().getFullYear() }))}
                  />
                </Field>
                <Field label="Fecha de lanzamiento (opcional)">
                  <Input
                    type="date"
                    value={draft.releaseDate}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDraft((p) => ({
                        ...p,
                        releaseDate: v,
                        releaseYear: v ? Number(v.slice(0, 4)) || p.releaseYear : p.releaseYear,
                      }));
                    }}
                  />
                  <p className="text-[11px] text-[var(--text-muted)]">Si es futura, la página muestra cuenta regresiva.</p>
                </Field>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Field label="Destacado">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={draft.featured}
                      onCheckedChange={(v) => setDraft((p) => ({ ...p, featured: v === true }))}
                    />
                    Sí en portada
                  </label>
                </Field>
                <Field label="Próximo (aparece en /releases)">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={draft.upcoming}
                      onCheckedChange={(v) => setDraft((p) => ({ ...p, upcoming: v === true }))}
                    />
                    Sí / No
                  </label>
                </Field>
              </div>
              <Field label="Descripción (opcional)">
                <Textarea
                  rows={5}
                  value={draft.description ?? ""}
                  onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value.trim().length ? e.target.value : null }))}
                />
              </Field>
            </div>

            <div className="space-y-4">
              <Field label="Portada (coverUrl)">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="preview portada" className="mb-3 h-28 w-full rounded-lg border border-border object-cover" />
                ) : (
                  <div className="mb-3 h-28 w-full rounded-lg border border-border bg-background-secondary" />
                )}
                <Input
                  placeholder="/uploads/..."
                  value={draft.coverUrl ?? ""}
                  onChange={(e) => setDraft((p) => ({ ...p, coverUrl: normalizeMaybeUrl(e.target.value) }))}
                />
                <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={onUploadCover} />
                {uploadingCover ? <p className="mt-1 text-xs text-primary">Subiendo...</p> : null}
              </Field>

              <fieldset className="space-y-2 rounded-lg border border-border p-3">
                <legend className="px-1 text-xs font-medium text-[var(--text-secondary)]">Smart links (opcionales)</legend>
                <p className="text-[11px] text-[var(--text-muted)]">Solo se muestran los que rellenes.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {SMART_LINKS.map((l) => {
                    const value = draft[l.key] ?? "";
                    const invalid = value.length > 0 && !isHttpUrl(value);
                    return (
                      <div key={l.key} className="space-y-1">
                        <Label htmlFor={`release-${l.key}`} className="text-[11px] text-[var(--text-secondary)]">
                          {l.label}
                        </Label>
                        <Input
                          id={`release-${l.key}`}
                          type="url"
                          inputMode="url"
                          placeholder={l.placeholder}
                          value={value}
                          aria-invalid={invalid || undefined}
                          aria-describedby={invalid ? `release-${l.key}-error` : undefined}
                          className={invalid ? "border-red-500/70" : undefined}
                          onChange={(e) => setDraft((p) => ({ ...p, [l.key]: normalizeMaybeUrl(e.target.value) }))}
                        />
                        {invalid ? (
                          <p id={`release-${l.key}-error`} role="alert" className="text-[10px] text-red-400">
                            Debe empezar por https://
                          </p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </fieldset>

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
            <AlertDialogTitle>¿Borrar esta release?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{deleteTarget?.title ?? ""}» ({deleteTarget?.slug ?? ""}). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancelar</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteBusy}
              onClick={() => void confirmDeleteRelease()}
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

