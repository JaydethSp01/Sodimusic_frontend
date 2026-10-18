"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Disc3, ExternalLink, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import type { Release } from "@/types/models";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { toast } from "sonner";
import { AdminTable, AdminTableActions, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "@/components/ds/admin-table";
import { EmptyState } from "@/components/ds/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/chip";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldError } from "@/components/ui/field-error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadAdminFile } from "@/app/actions/admin-upload";
import { createReleaseAction, deleteReleaseAction, patchReleaseAction } from "@/app/actions/admin-releases-actions";
import {
  AdminDialogFooter,
  AdminField,
  AdminModuleToolbar,
  AdminResultsBar,
  RowAction,
  adminDialogClass,
} from "@/features/admin/components/admin-primitives";
import { cn } from "@/lib/utils";

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
type ReleaseFilter = "ALL" | "UPCOMING" | "FEATURED";

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

const fileInputClass =
  "block w-full cursor-pointer text-body-sm text-text-2 file:mr-3 file:cursor-pointer file:rounded file:border file:border-line-2 file:bg-ink-3 file:px-3 file:py-2 file:text-body-sm file:font-medium file:text-text-1";

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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ReleaseFilter>("ALL");

  const coverPreview = useMemo(() => (draft.coverUrl ? resolveMediaUrl(draft.coverUrl) : null), [draft.coverUrl]);

  /* Filtro solo de presentación (no toca datos ni URL). */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialItems.filter((r) => {
      if (filter === "UPCOMING" && !r.upcoming) return false;
      if (filter === "FEATURED" && !r.featured) return false;
      if (!q) return true;
      return [r.title, r.slug, r.artistName, r.genre, String(r.releaseYear)].some((s) => s.toLowerCase().includes(q));
    });
  }, [initialItems, query, filter]);

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
    <div className="space-y-4">
      <AdminModuleToolbar
        search={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" aria-hidden />
            <Input type="search" aria-label="Buscar releases" placeholder="Buscar por título, slug, artista o año…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
          </div>
        }
        filters={
          <div role="group" aria-label="Filtrar releases" className="flex flex-wrap gap-2">
            <Chip selected={filter === "ALL"} onClick={() => setFilter("ALL")}>
              Todas
            </Chip>
            <Chip selected={filter === "UPCOMING"} onClick={() => setFilter("UPCOMING")} count={initialItems.filter((r) => r.upcoming).length}>
              Próximas
            </Chip>
            <Chip selected={filter === "FEATURED"} onClick={() => setFilter("FEATURED")} count={initialItems.filter((r) => r.featured).length}>
              Destacadas
            </Chip>
          </div>
        }
        summary={`${visible.length} de ${initialItems.length}`}
        action={
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus aria-hidden /> Nueva release
          </Button>
        }
      />

      {initialItems.length === 0 ? (
        <EmptyState
          icon={Disc3}
          title="Aún no hay releases"
          description="Crea el primer lanzamiento con portada, fecha y smart links: tendrá su página en /releases."
          action={
            <Button type="button" onClick={openCreate}>
              <Plus aria-hidden /> Nueva release
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description="Prueba con otro texto o quita el filtro." />
      ) : (
        <div className="scroll-fade-x overflow-x-auto md:[mask-image:none]">
          <AdminTable>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeader>Release</AdminTableHeader>
                <AdminTableHeader>Artista</AdminTableHeader>
                <AdminTableHeader align="right">Año</AdminTableHeader>
                <AdminTableHeader>Estado</AdminTableHeader>
                <AdminTableHeader align="right">
                  <span className="sr-only">Acciones</span>
                </AdminTableHeader>
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {visible.map((r) => (
                <AdminTableRow key={r.id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={r.title} src={r.coverUrl ? resolveMediaUrl(r.coverUrl) : null} size={40} square />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{r.title}</p>
                        <p className="truncate font-mono text-body-sm text-text-3">/{r.slug}</p>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>{r.artistName}</AdminTableCell>
                  <AdminTableCell mono align="right">
                    {r.releaseYear}
                  </AdminTableCell>
                  <AdminTableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={r.upcoming ? "sea" : "neutral"}>{r.upcoming ? "Próximo" : "Catálogo"}</Badge>
                      {r.featured ? (
                        <Badge tone="gold" icon={<Star aria-hidden />}>
                          Destacada
                        </Badge>
                      ) : null}
                    </div>
                  </AdminTableCell>
                  <AdminTableActions>
                    <RowAction label="Preview" asChild>
                      <a href={`/releases/${r.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink />
                      </a>
                    </RowAction>
                    <RowAction label="Editar" onClick={() => openEdit(r)}>
                      <Pencil />
                    </RowAction>
                    <RowAction label="Borrar" className="hover:text-danger" onClick={() => setDeleteTarget(r)}>
                      <Trash2 />
                    </RowAction>
                  </AdminTableActions>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        </div>
      )}
      <AdminResultsBar summary={initialItems.length ? `${initialItems.length} ${initialItems.length === 1 ? "release" : "releases"}` : undefined} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={cn(adminDialogClass, "max-w-3xl")}>
          <DialogHeader>
            <DialogTitle className="text-title">
              <span className="inline-flex flex-wrap items-center gap-2">
                {mode === "create" ? "Crear release" : "Editar release"}
                <Badge tone={draft.upcoming ? "sea" : "neutral"} size="md">
                  {draft.upcoming ? "Próximo" : "Catálogo"}
                </Badge>
              </span>
            </DialogTitle>
            <DialogDescription>Título, slug, artista y género son obligatorios. Los smart links solo se muestran si los rellenas.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <AdminField label="Título">
                <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
              </AdminField>
              <AdminField label="Slug (único)" hint="Parte final de la URL: /releases/mi-release">
                <Input value={draft.slug} onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value }))} />
              </AdminField>
              <AdminField label="Artista">
                <Input value={draft.artistName} onChange={(e) => setDraft((p) => ({ ...p, artistName: e.target.value }))} />
              </AdminField>
              <AdminField label="Género">
                <Input value={draft.genre} onChange={(e) => setDraft((p) => ({ ...p, genre: e.target.value }))} />
              </AdminField>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Año de release">
                  <Input type="number" value={draft.releaseYear} onChange={(e) => setDraft((p) => ({ ...p, releaseYear: Number(e.target.value) || new Date().getFullYear() }))} />
                </AdminField>
                <AdminField label="Fecha de lanzamiento (opcional)" hint="Si es futura, la página muestra cuenta regresiva.">
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
                </AdminField>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-1">
                  <Checkbox checked={draft.featured} onCheckedChange={(v) => setDraft((p) => ({ ...p, featured: v === true }))} />
                  Destacada en portada
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-1">
                  <Checkbox checked={draft.upcoming} onCheckedChange={(v) => setDraft((p) => ({ ...p, upcoming: v === true }))} />
                  Próximo (aparece en /releases)
                </label>
              </div>
              <AdminField label="Descripción (opcional)">
                <Textarea rows={5} value={draft.description ?? ""} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value.trim().length ? e.target.value : null }))} />
              </AdminField>
            </div>

            <div className="space-y-4">
              <AdminField label="Portada (coverUrl)" hint="JPG, PNG o WebP. Cuadrada, mínimo 600 px.">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="Previsualización de la portada" className="h-32 w-full rounded border border-line-1 object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded border border-dashed border-line-2 bg-ink-1 text-text-3">
                    <Disc3 className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                  </div>
                )}
                <Input placeholder="/uploads/… o https://" value={draft.coverUrl ?? ""} onChange={(e) => setDraft((p) => ({ ...p, coverUrl: normalizeMaybeUrl(e.target.value) }))} />
                <input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Subir portada" className={fileInputClass} onChange={onUploadCover} />
                {uploadingCover ? (
                  <p className="text-body-sm text-fire-400" role="status">
                    Subiendo…
                  </p>
                ) : null}
              </AdminField>

              <fieldset className="space-y-3 rounded-lg border border-line-1 bg-ink-1/60 p-4">
                <legend className="px-1 text-label text-text-3">Smart links (opcionales)</legend>
                <p className="text-body-sm text-text-3">Solo se muestran los que rellenes.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {SMART_LINKS.map((l) => {
                    const value = draft[l.key] ?? "";
                    const invalid = value.length > 0 && !isHttpUrl(value);
                    return (
                      <div key={l.key} className="flex flex-col gap-2">
                        <Label htmlFor={`release-${l.key}`}>{l.label}</Label>
                        <Input
                          id={`release-${l.key}`}
                          type="url"
                          inputMode="url"
                          placeholder={l.placeholder}
                          value={value}
                          aria-invalid={invalid || undefined}
                          aria-describedby={invalid ? `release-${l.key}-error` : undefined}
                          onChange={(e) => setDraft((p) => ({ ...p, [l.key]: normalizeMaybeUrl(e.target.value) }))}
                        />
                        {invalid ? (
                          <FieldError id={`release-${l.key}-error`} className="mt-0">
                            Debe empezar por https://
                          </FieldError>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          </div>

          <AdminDialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" loading={saving} onClick={() => void onSave()}>
              Guardar
            </Button>
          </AdminDialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className={adminDialogClass}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-title">¿Borrar esta release?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{deleteTarget?.title ?? ""}» ({deleteTarget?.slug ?? ""}). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancelar</AlertDialogCancel>
            <Button type="button" variant="danger" loading={deleteBusy} onClick={() => void confirmDeleteRelease()}>
              Borrar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
