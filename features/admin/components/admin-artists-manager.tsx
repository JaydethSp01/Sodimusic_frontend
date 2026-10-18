"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { ArrowDown, ArrowUp, ExternalLink, MicVocal, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Artist, ArtistStatus } from "@/types/models";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { parseYoutubeChannelId } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import { AdminTable, AdminTableActions, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "@/components/ds/admin-table";
import { EmptyState } from "@/components/ds/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/features/admin/components/image-upload-field";
import {
  AdminDialogFooter,
  AdminErrorNotice,
  AdminField,
  AdminModuleToolbar,
  AdminNativeSelect,
  AdminResultsBar,
  RowAction,
  adminDialogClass,
} from "@/features/admin/components/admin-primitives";
import { PRODUCER_ROLE, slugifyName } from "@/features/artists/api";
import { artistHref, buildAdminArtistsHref } from "@/features/artists/hrefs";
import { createArtistAction, deleteArtistAction, moveArtistAction, patchArtistAction } from "@/app/actions/admin-artists-actions";

const STATUS_META: Record<ArtistStatus, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: "Activo", tone: "success" },
  HIDDEN: { label: "Oculto", tone: "neutral" },
};

export const ARTIST_ROLES = [PRODUCER_ROLE, "Artista", "Crew", "Aliado"] as const;

type ArtistDraft = {
  name: string;
  slug: string;
  /** true mientras el slug se deriva del nombre (hasta que el usuario lo edite a mano). */
  slugAuto: boolean;
  role: string;
  city: string;
  genres: string;
  aliases: string;
  shortBio: string;
  bio: string;
  photoUrl: string;
  coverUrl: string;
  spotifyUrl: string;
  appleUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  youtubeChannelId: string;
  featured: boolean;
  status: ArtistStatus;
};

const emptyDraft = (): ArtistDraft => ({
  name: "",
  slug: "",
  slugAuto: true,
  role: "Artista",
  city: "",
  genres: "",
  aliases: "",
  shortBio: "",
  bio: "",
  photoUrl: "",
  coverUrl: "",
  spotifyUrl: "",
  appleUrl: "",
  youtubeUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  facebookUrl: "",
  youtubeChannelId: "",
  featured: false,
  status: "ACTIVE",
});

function draftFromRow(row: Artist): ArtistDraft {
  return {
    name: row.name,
    slug: row.slug,
    slugAuto: false,
    role: row.role,
    city: row.city ?? "",
    genres: row.genres.join(", "),
    aliases: row.aliases.join(", "),
    shortBio: row.shortBio ?? "",
    bio: row.bio ?? "",
    photoUrl: row.photoUrl ?? "",
    coverUrl: row.coverUrl ?? "",
    spotifyUrl: row.spotifyUrl ?? "",
    appleUrl: row.appleUrl ?? "",
    youtubeUrl: row.youtubeUrl ?? "",
    instagramUrl: row.instagramUrl ?? "",
    tiktokUrl: row.tiktokUrl ?? "",
    facebookUrl: row.facebookUrl ?? "",
    youtubeChannelId: row.youtubeChannelId ?? "",
    featured: row.featured,
    status: row.status,
  };
}

/** "a, b ,, c" → ["a", "b", "c"] sin duplicados. */
export function splitList(value: string): string[] {
  return Array.from(new Set(value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)));
}

function optionalUrl(value: string): string | null {
  const v = value.trim();
  return v.length ? v : null;
}

function isValidUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    const u = new URL(value.trim());
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

const URL_FIELDS: Array<{ key: keyof Pick<ArtistDraft, "spotifyUrl" | "appleUrl" | "youtubeUrl" | "instagramUrl" | "tiktokUrl" | "facebookUrl">; label: string; placeholder: string }> = [
  { key: "spotifyUrl", label: "Spotify", placeholder: "https://open.spotify.com/artist/…" },
  { key: "appleUrl", label: "Apple Music", placeholder: "https://music.apple.com/…" },
  { key: "youtubeUrl", label: "YouTube", placeholder: "https://www.youtube.com/@…" },
  { key: "instagramUrl", label: "Instagram", placeholder: "https://www.instagram.com/…" },
  { key: "tiktokUrl", label: "TikTok", placeholder: "https://www.tiktok.com/@…" },
  { key: "facebookUrl", label: "Facebook", placeholder: "https://www.facebook.com/…" },
];

interface AdminArtistsManagerProps {
  items: Artist[];
  query: string;
  status: string;
  /** La API de artistas respondió 404 (aún no desplegada). */
  apiMissing?: boolean;
}

export function AdminArtistsManager({ items, query, status, apiMissing = false }: AdminArtistsManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<Artist | null>(null);
  const [draft, setDraft] = useState<ArtistDraft>(() => emptyDraft());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Artist | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(query);
  const [navPending, startNav] = useTransition();

  const busy = saving;
  const filtered = Boolean(query || status);
  const detectedChannelId = useMemo(() => (draft.youtubeUrl.trim() ? parseYoutubeChannelId(draft.youtubeUrl) : null), [draft.youtubeUrl]);
  const effectiveChannelId = draft.youtubeChannelId.trim() || detectedChannelId || "";

  function navigate(next: { q?: string; status?: string }) {
    startNav(() => {
      router.push(buildAdminArtistsHref({ q: query, status, ...next }));
    });
  }

  function onSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate({ q: searchValue });
  }

  function openCreate() {
    setMode("create");
    setEditing(null);
    setDraft(emptyDraft());
    setOpen(true);
  }

  function openEdit(row: Artist) {
    setMode("edit");
    setEditing(row);
    setDraft(draftFromRow(row));
    setOpen(true);
  }

  function setName(name: string) {
    setDraft((p) => ({ ...p, name, slug: p.slugAuto ? slugifyName(name) : p.slug }));
  }

  function buildPayload() {
    return {
      name: draft.name.trim(),
      slug: slugifyName(draft.slug.trim() || draft.name.trim()),
      role: draft.role.trim() || "Artista",
      city: optionalUrl(draft.city),
      genres: splitList(draft.genres),
      aliases: splitList(draft.aliases),
      shortBio: optionalUrl(draft.shortBio),
      bio: optionalUrl(draft.bio),
      photoUrl: optionalUrl(draft.photoUrl),
      coverUrl: optionalUrl(draft.coverUrl),
      spotifyUrl: optionalUrl(draft.spotifyUrl),
      appleUrl: optionalUrl(draft.appleUrl),
      youtubeUrl: optionalUrl(draft.youtubeUrl),
      instagramUrl: optionalUrl(draft.instagramUrl),
      tiktokUrl: optionalUrl(draft.tiktokUrl),
      facebookUrl: optionalUrl(draft.facebookUrl),
      youtubeChannelId: effectiveChannelId.length ? effectiveChannelId : null,
      featured: draft.featured,
      status: draft.status,
    };
  }

  async function onSave() {
    if (busy) return;
    const name = draft.name.trim();
    if (name.length < 2) {
      toast.error("El nombre es obligatorio (mínimo 2 caracteres)");
      return;
    }
    if (name.length > 80) {
      toast.error("El nombre no puede superar los 80 caracteres");
      return;
    }
    const invalid = URL_FIELDS.find((f) => !isValidUrl(draft[f.key]));
    if (invalid) {
      toast.error(`La URL de ${invalid.label} no es válida (debe empezar por https://)`);
      return;
    }
    if (draft.youtubeChannelId.trim() && !/^UC[\w-]{22}$/.test(draft.youtubeChannelId.trim())) {
      toast.error("El channelId de YouTube debe tener el formato UC… (24 caracteres)");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      const r = mode === "create" || !editing ? await createArtistAction(payload) : await patchArtistAction(editing.id, payload, editing.slug);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(mode === "create" ? "Artista creado" : "Artista actualizado");
      setOpen(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteArtistAction(deleteTarget.id, deleteTarget.slug);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Artista borrado");
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleteBusy(false);
    }
  }

  async function toggleFeatured(row: Artist) {
    setRowBusy(row.id);
    try {
      const r = await patchArtistAction(row.id, { featured: !row.featured }, row.slug);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(!row.featured ? "Marcado como destacado" : "Ya no es destacado");
      router.refresh();
    } finally {
      setRowBusy(null);
    }
  }

  async function move(index: number, dir: "up" | "down") {
    const row = items[index];
    const neighbor = items[dir === "up" ? index - 1 : index + 1];
    if (!row || !neighbor) return;
    setRowBusy(row.id);
    try {
      const r = await moveArtistAction(row.id, neighbor.id, dir);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Orden actualizado");
      router.refresh();
    } finally {
      setRowBusy(null);
    }
  }

  const summary = `${items.length} ${items.length === 1 ? "artista" : "artistas"}`;

  return (
    <div className="space-y-4">
      {apiMissing ? (
        <AdminErrorNotice title="La API de artistas todavía no responde">
          El backend aún no expone <code className="font-mono">/api/admin/artists</code>. Cuando esté desplegado, esta tabla mostrará los artistas sembrados desde el sitio web.
        </AdminErrorNotice>
      ) : null}

      <AdminModuleToolbar
        search={
          <form onSubmit={onSearchSubmit} role="search" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" aria-hidden />
              <Input
                type="search"
                name="q"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Buscar por nombre, alias, ciudad…"
                aria-label="Buscar artistas"
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline" disabled={navPending}>
              Buscar
            </Button>
          </form>
        }
        filters={
          <div className="flex items-center gap-2">
            <Label htmlFor="admin-artists-status" className="shrink-0">
              Estado
            </Label>
            <AdminNativeSelect id="admin-artists-status" className="w-auto min-w-36" value={status} disabled={navPending} onChange={(e) => navigate({ status: e.target.value })}>
              <option value="">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="HIDDEN">Ocultos</option>
            </AdminNativeSelect>
          </div>
        }
        summary={summary}
        action={
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus aria-hidden /> Nuevo artista
          </Button>
        }
      />

      {items.length === 0 ? (
        filtered ? (
          <EmptyState icon={Search} title="Sin resultados" description="No hay artistas que coincidan con el filtro. Prueba con otro texto o estado." />
        ) : (
          <EmptyState
            icon={MicVocal}
            title="Aún no hay artistas"
            description="Crea la ficha del productor principal y del crew: se mostrarán en /artists y cada uno tendrá su página con plataformas, temas y videos."
            action={
              <Button type="button" onClick={openCreate}>
                <Plus aria-hidden /> Nuevo artista
              </Button>
            }
          />
        )
      ) : (
        <div className={cn("scroll-fade-x overflow-x-auto transition-opacity duration-150 md:[mask-image:none]", navPending && "opacity-60")} aria-busy={navPending}>
          <AdminTable>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeader>Artista</AdminTableHeader>
                <AdminTableHeader>Rol</AdminTableHeader>
                <AdminTableHeader>Destacado</AdminTableHeader>
                <AdminTableHeader>Estado</AdminTableHeader>
                <AdminTableHeader>Orden</AdminTableHeader>
                <AdminTableHeader align="right">
                  <span className="sr-only">Acciones</span>
                </AdminTableHeader>
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {items.map((a, i) => {
                const meta = STATUS_META[a.status] ?? STATUS_META.HIDDEN;
                const isBusy = rowBusy === a.id;
                const photo = a.photoUrl?.trim() ? resolveMediaUrl(a.photoUrl) : null;
                return (
                  <AdminTableRow key={a.id} className={cn(isBusy && "opacity-60", a.status === "HIDDEN" && "opacity-80")}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={a.name} src={photo} size={40} />
                        <div className="min-w-0 max-w-[280px]">
                          <p className="truncate font-semibold">{a.name}</p>
                          <p className="truncate font-mono text-body-sm text-text-3" title={artistHref(a.slug)}>
                            /{a.slug}
                            {a.city ? <span> · {a.city}</span> : null}
                          </p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-col gap-1">
                        <span>{a.role}</span>
                        {a.genres.length ? <span className="font-mono text-body-sm text-text-3">{a.genres.slice(0, 3).join(" · ")}</span> : null}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-body-sm">
                        <Checkbox checked={a.featured} disabled={isBusy} aria-label={a.featured ? "Quitar destacado" : "Marcar destacado"} onCheckedChange={() => void toggleFeatured(a)} />
                        {a.featured ? (
                          <Badge tone="gold" icon={<Star aria-hidden />}>
                            Sí
                          </Badge>
                        ) : (
                          <span className="text-text-3">No</span>
                        )}
                      </label>
                    </AdminTableCell>
                    <AdminTableCell>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-1">
                        <span className="w-6 font-mono text-body-sm tabular-nums text-text-2">{a.sortOrder}</span>
                        <RowAction label={`Subir ${a.name}`} disabled={i === 0 || isBusy || rowBusy !== null} onClick={() => void move(i, "up")}>
                          <ArrowUp />
                        </RowAction>
                        <RowAction label={`Bajar ${a.name}`} disabled={i === items.length - 1 || isBusy || rowBusy !== null} onClick={() => void move(i, "down")}>
                          <ArrowDown />
                        </RowAction>
                      </div>
                    </AdminTableCell>
                    <AdminTableActions>
                      <RowAction label={`Ver ficha de ${a.name}`} asChild>
                        <Link href={artistHref(a.slug)} target="_blank" rel="noopener noreferrer">
                          <ExternalLink />
                        </Link>
                      </RowAction>
                      <RowAction label="Editar" onClick={() => openEdit(a)}>
                        <Pencil />
                      </RowAction>
                      <RowAction label="Borrar" className="hover:text-danger" onClick={() => setDeleteTarget(a)}>
                        <Trash2 />
                      </RowAction>
                    </AdminTableActions>
                  </AdminTableRow>
                );
              })}
            </AdminTableBody>
          </AdminTable>
        </div>
      )}

      <AdminResultsBar summary={items.length ? summary : undefined} />

      <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <DialogContent className={cn(adminDialogClass, "max-w-4xl")}>
          <DialogHeader>
            <DialogTitle className="text-title">{mode === "create" ? "Crear artista" : "Editar artista"}</DialogTitle>
            <DialogDescription>Nombre y rol son obligatorios. El slug (la URL de la ficha) se genera solo a partir del nombre.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <AdminField label="Nombre">
                <Input value={draft.name} onChange={(e) => setName(e.target.value)} placeholder="JeiVy LaZy" maxLength={80} />
              </AdminField>
              <AdminField label="Slug" hint={draft.slug ? `Ficha pública en /artists/${slugifyName(draft.slug) || "…"}` : "Se genera a partir del nombre."}>
                <Input value={draft.slug} onChange={(e) => setDraft((p) => ({ ...p, slug: e.target.value, slugAuto: e.target.value.trim().length === 0 }))} placeholder="jeivy-lazy" maxLength={80} />
              </AdminField>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Rol">
                  <Input list="admin-artist-roles" value={draft.role} onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value }))} placeholder="Artista" maxLength={40} />
                  <datalist id="admin-artist-roles">
                    {ARTIST_ROLES.map((r) => (
                      <option key={r} value={r} />
                    ))}
                  </datalist>
                </AdminField>
                <AdminField label="Ciudad">
                  <Input value={draft.city} onChange={(e) => setDraft((p) => ({ ...p, city: e.target.value }))} placeholder="María La Baja" maxLength={80} />
                </AdminField>
              </div>
              <AdminField label="Géneros" hint="Separados por comas.">
                <Input value={draft.genres} onChange={(e) => setDraft((p) => ({ ...p, genres: e.target.value }))} placeholder="Reggaeton, Trap, Afrobeat" />
              </AdminField>
              <AdminField label="Alias" hint="Otros nombres con los que aparece en producciones y releases (separados por comas).">
                <Input value={draft.aliases} onChange={(e) => setDraft((p) => ({ ...p, aliases: e.target.value }))} placeholder="J Col, J Col El Crazy" />
              </AdminField>
              <AdminField label="Bio corta" hint="1–2 frases para las tarjetas y el resumen de la ficha.">
                <Textarea rows={2} value={draft.shortBio} onChange={(e) => setDraft((p) => ({ ...p, shortBio: e.target.value }))} maxLength={280} />
              </AdminField>
              <AdminField label="Bio" hint="Párrafos separados por una línea en blanco.">
                <Textarea rows={6} value={draft.bio} onChange={(e) => setDraft((p) => ({ ...p, bio: e.target.value }))} />
              </AdminField>
            </div>

            <div className="space-y-4">
              <ImageUploadField
                label="Foto"
                aspect="portrait"
                value={draft.photoUrl}
                onChange={(next) => setDraft((p) => ({ ...p, photoUrl: next }))}
                hint="Vertical 3:4, mínimo 900×1200. Sin foto se usa la inicial del nombre."
                disabled={busy}
              />
              <ImageUploadField
                label="Portada (opcional)"
                aspect="video"
                value={draft.coverUrl}
                onChange={(next) => setDraft((p) => ({ ...p, coverUrl: next }))}
                hint="Fondo ancho del encabezado de la ficha."
                disabled={busy}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                {URL_FIELDS.map((f) => (
                  <AdminField key={f.key} label={f.label}>
                    <Input type="url" inputMode="url" value={draft[f.key]} onChange={(e) => setDraft((p) => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} />
                  </AdminField>
                ))}
              </div>
              <AdminField label="Channel ID de YouTube" hint="UC… Se detecta solo si la URL de YouTube es /channel/UC…; sirve para listar sus videos en la ficha.">
                <Input value={draft.youtubeChannelId} onChange={(e) => setDraft((p) => ({ ...p, youtubeChannelId: e.target.value }))} placeholder={detectedChannelId ?? "UC…"} maxLength={24} />
                {detectedChannelId && !draft.youtubeChannelId.trim() ? (
                  <p className="font-mono text-body-sm text-text-3" aria-live="polite">
                    channelId: <span className="text-fire-400">{detectedChannelId}</span> (detectado de la URL)
                  </p>
                ) : null}
              </AdminField>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Estado">
                  <AdminNativeSelect value={draft.status} onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as ArtistStatus }))}>
                    <option value="ACTIVE">Activo (visible)</option>
                    <option value="HIDDEN">Oculto</option>
                  </AdminNativeSelect>
                </AdminField>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 self-end text-body-sm text-text-1">
                  <Checkbox checked={draft.featured} onCheckedChange={(v) => setDraft((p) => ({ ...p, featured: v === true }))} />
                  Destacado
                </label>
              </div>
            </div>
          </div>

          <AdminDialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" loading={saving} onClick={() => void onSave()}>
              Guardar
            </Button>
          </AdminDialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && !deleteBusy && setDeleteTarget(null)}>
        <AlertDialogContent className={adminDialogClass}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-title">¿Borrar este artista?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la ficha de «{deleteTarget?.name ?? ""}» y dejará de existir /artists/{deleteTarget?.slug ?? ""}. Esta acción no se puede deshacer. Si solo quieres ocultarlo, cámbialo a «Oculto».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancelar</AlertDialogCancel>
            <Button type="button" variant="danger" loading={deleteBusy} onClick={() => void confirmDelete()}>
              Borrar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
