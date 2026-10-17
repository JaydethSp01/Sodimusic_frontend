"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ExternalLink, Search, Youtube } from "lucide-react";
import { toast } from "sonner";
import type { ChannelStatus, YoutubeChannel } from "@/types/models";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { isYoutubeUrl, parseYoutubeChannelId, parseYoutubeVideoId } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
import { ImageUploadField } from "@/features/admin/components/image-upload-field";
import {
  createChannelAction,
  deleteChannelAction,
  moveChannelAction,
  patchChannelAction,
} from "@/app/actions/admin-channels-actions";

export const ADMIN_CHANNELS_PAGE_SIZE = 20;

const STATUS_META: Record<ChannelStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Activo", className: "border-transparent bg-primary-muted text-primary" },
  HIDDEN: { label: "Oculto", className: "border-transparent bg-background-elevated text-[var(--text-secondary)]" },
};

const nativeSelectClass =
  "flex h-10 w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type ChannelDraft = {
  name: string;
  url: string;
  /** channelId guardado (se conserva si la URL nueva no permite detectarlo) */
  savedChannelId: string | null;
  description: string;
  avatarUrl: string;
  featuredVideoUrl: string;
  category: string;
  featured: boolean;
  status: ChannelStatus;
};

const emptyDraft = (): ChannelDraft => ({
  name: "",
  savedChannelId: null,
  url: "",
  description: "",
  avatarUrl: "",
  featuredVideoUrl: "",
  category: "Crew",
  featured: false,
  status: "ACTIVE",
});

function draftFromRow(row: YoutubeChannel): ChannelDraft {
  return {
    name: row.name,
    url: row.url,
    savedChannelId: row.channelId,
    description: row.description ?? "",
    avatarUrl: row.avatarUrl ?? "",
    featuredVideoUrl: row.featuredVideoUrl ?? "",
    category: row.category,
    featured: row.featured,
    status: row.status,
  };
}

/** Misma heurística que el backend: /channel/UC…, /@handle, /c/x, /user/x. */
export function detectChannelFromUrl(url: string): { channelId: string | null; handle: string | null } {
  const channelId = parseYoutubeChannelId(url);
  if (channelId) return { channelId, handle: null };
  if (!isYoutubeUrl(url)) return { channelId: null, handle: null };
  try {
    const u = new URL(url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`);
    const parts = u.pathname.split("/").filter(Boolean);
    const first = parts[0] ?? "";
    if (first.startsWith("@") && first.length > 1) return { channelId: null, handle: first.slice(1) };
    if ((first === "c" || first === "user") && parts[1]) return { channelId: null, handle: parts[1] };
  } catch {
    /* URL inválida */
  }
  return { channelId: null, handle: null };
}

function buildAdminHref(params: { q?: string; status?: string; page?: number }): string {
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.status) qs.set("status", params.status);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  const s = qs.toString();
  return s ? `/admin/dashboard/canales?${s}` : "/admin/dashboard/canales";
}

interface AdminChannelsManagerProps {
  items: YoutubeChannel[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  status: string;
  /** Categorías existentes (datalist del formulario). */
  categories: string[];
}

export function AdminChannelsManager({ items, total, page, pageSize, query, status, categories }: AdminChannelsManagerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ChannelDraft>(() => emptyDraft());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<YoutubeChannel | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(query);
  const [navPending, startNav] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const detected = useMemo(() => detectChannelFromUrl(draft.url), [draft.url]);
  const featuredVideoId = useMemo(
    () => (draft.featuredVideoUrl.trim() ? parseYoutubeVideoId(draft.featuredVideoUrl) : null),
    [draft.featuredVideoUrl],
  );
  const categoryOptions = useMemo(() => {
    const set = new Set<string>(categories);
    for (const c of items) if (c.category?.trim()) set.add(c.category.trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [categories, items]);

  const busy = saving;

  function navigate(next: { q?: string; status?: string; page?: number }) {
    startNav(() => {
      router.push(buildAdminHref({ q: query, status, page: 1, ...next }));
    });
  }

  function onSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate({ q: searchValue, page: 1 });
  }

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setDraft(emptyDraft());
    setOpen(true);
  }

  function openEdit(row: YoutubeChannel) {
    setMode("edit");
    setEditingId(row.id);
    setDraft(draftFromRow(row));
    setOpen(true);
  }

  function buildPayload() {
    const description = draft.description.trim();
    const avatarUrl = draft.avatarUrl.trim();
    const featuredVideoUrl = draft.featuredVideoUrl.trim();
    return {
      name: draft.name.trim(),
      url: draft.url.trim(),
      channelId: detected.channelId ?? draft.savedChannelId,
      handle: detected.handle,
      description: description.length ? description : null,
      avatarUrl: avatarUrl.length ? avatarUrl : null,
      featuredVideoUrl: featuredVideoUrl.length ? featuredVideoUrl : null,
      category: draft.category.trim() || "Crew",
      featured: draft.featured,
      status: draft.status,
    };
  }

  async function onSave() {
    if (busy) return;
    if (!draft.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!draft.url.trim() || !isYoutubeUrl(draft.url)) {
      toast.error("Indica una URL válida de YouTube (youtube.com/@handle o /channel/UC…)");
      return;
    }
    if (draft.featuredVideoUrl.trim() && !featuredVideoId) {
      toast.error("El video destacado debe ser una URL de YouTube (watch?v=, youtu.be/, shorts/)");
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload();
      const r =
        mode === "create" || !editingId
          ? await createChannelAction(payload)
          : await patchChannelAction(editingId, payload);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(mode === "create" ? "Canal creado" : "Canal actualizado");
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
      const r = await deleteChannelAction(deleteTarget.id);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Canal borrado");
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleteBusy(false);
    }
  }

  async function toggleFeatured(row: YoutubeChannel) {
    setRowBusy(row.id);
    try {
      const r = await patchChannelAction(row.id, { featured: !row.featured });
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
      const r = await moveChannelAction(row.id, neighbor.id, dir);
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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="font-display text-xl">Canales de YouTube</CardTitle>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Canales del sello, crew y aliados que se muestran en el inicio (destacados) y en «/canales». Los textos de la
              sección se editan en «Sitio web → Canales».
            </p>
          </div>
          <Button type="button" onClick={openCreate}>
            Nuevo canal
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form onSubmit={onSearchSubmit} role="search" className="flex w-full max-w-md gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden />
                <Input
                  type="search"
                  name="q"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Buscar por nombre, @handle, URL…"
                  aria-label="Buscar canales"
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline" disabled={navPending}>
                Buscar
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <Label htmlFor="admin-channels-status" className="text-xs text-[var(--text-secondary)]">
                Estado
              </Label>
              <select
                id="admin-channels-status"
                className={cn(nativeSelectClass, "w-auto min-w-36")}
                value={status}
                disabled={navPending}
                onChange={(e) => navigate({ status: e.target.value, page: 1 })}
              >
                <option value="">Todos</option>
                <option value="ACTIVE">Activos</option>
                <option value="HIDDEN">Ocultos</option>
              </select>
            </div>
          </div>

          <div className={cn("overflow-x-auto transition-opacity", navPending && "opacity-60")} aria-busy={navPending}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Avatar</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Destacado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((ch, i) => {
                  const meta = STATUS_META[ch.status] ?? STATUS_META.HIDDEN;
                  const isBusy = rowBusy === ch.id;
                  const avatar = ch.avatarUrl?.trim() ? resolveMediaUrl(ch.avatarUrl) : null;
                  return (
                    <TableRow key={ch.id} className={cn(isBusy && "opacity-60")}>
                      <TableCell>
                        {avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatar} alt="" className="h-12 w-12 rounded-full border border-border object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-border text-[var(--text-muted)]">
                            <Youtube className="h-4 w-4" aria-hidden />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex max-w-[280px] flex-col">
                          <span className="truncate">{ch.name}</span>
                          <span className="truncate font-mono text-[11px] text-[var(--text-muted)]" title={ch.url}>
                            {ch.handle ? `@${ch.handle}` : ch.channelId ?? ch.url}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{ch.category}</TableCell>
                      <TableCell>
                        <label className="flex items-center gap-2 text-xs">
                          <Checkbox
                            checked={ch.featured}
                            disabled={isBusy}
                            aria-label={ch.featured ? "Quitar destacado" : "Marcar destacado"}
                            onCheckedChange={() => void toggleFeatured(ch)}
                          />
                          <span className="text-[var(--text-muted)]">{ch.featured ? "Sí" : "No"}</span>
                        </label>
                      </TableCell>
                      <TableCell>
                        <Badge className={meta.className}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="w-6 font-mono text-xs">{ch.sortOrder}</span>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            aria-label={`Subir ${ch.name}`}
                            disabled={i === 0 || isBusy || rowBusy !== null}
                            onClick={() => void move(i, "up")}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            aria-label={`Bajar ${ch.name}`}
                            disabled={i === items.length - 1 || isBusy || rowBusy !== null}
                            onClick={() => void move(i, "down")}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => openEdit(ch)}>
                            Editar
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={ch.url} target="_blank" rel="noopener noreferrer">
                              YouTube
                              <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden />
                            </a>
                          </Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setDeleteTarget(ch)}>
                            Borrar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-[var(--text-muted)]">
                      {query || status
                        ? "No hay canales que coincidan con el filtro."
                        : "No hay canales todavía. Crea el primero con «Nuevo canal»."}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
              {total} {total === 1 ? "canal" : "canales"} · Página {Math.min(page, totalPages)} de {totalPages}
            </p>
            {totalPages > 1 ? (
              <nav aria-label="Paginación" className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild={page > 1} disabled={page <= 1}>
                  {page > 1 ? (
                    <Link href={buildAdminHref({ q: query, status, page: page - 1 })} rel="prev">
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      Anterior
                    </Link>
                  ) : (
                    <span>
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      Anterior
                    </span>
                  )}
                </Button>
                <Button variant="outline" size="sm" asChild={page < totalPages} disabled={page >= totalPages}>
                  {page < totalPages ? (
                    <Link href={buildAdminHref({ q: query, status, page: page + 1 })} rel="next">
                      Siguiente
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : (
                    <span>
                      Siguiente
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </span>
                  )}
                </Button>
              </nav>
            ) : null}
          </div>
        </CardContent>

        <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
          <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{mode === "create" ? "Crear canal" : "Editar canal"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Field label="Nombre">
                  <Input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Sodimusic" />
                </Field>
                <Field label="URL del canal" hint="Se autodetecta el channelId (UC…) o el @handle.">
                  <Input
                    type="url"
                    inputMode="url"
                    value={draft.url}
                    onChange={(e) => setDraft((p) => ({ ...p, url: e.target.value }))}
                    placeholder="https://www.youtube.com/@sodimusic"
                  />
                  <p className="font-mono text-[11px] text-[var(--text-muted)]" aria-live="polite">
                    {!draft.url.trim() ? (
                      "Sin URL"
                    ) : detected.channelId ? (
                      <>
                        channelId: <span className="text-primary">{detected.channelId}</span> · lista de subidas disponible
                      </>
                    ) : detected.handle ? (
                      <>
                        handle: <span className="text-primary">@{detected.handle}</span> · sin channelId: añade un video destacado
                        para el embed
                      </>
                    ) : isYoutubeUrl(draft.url) ? (
                      "URL de YouTube sin canal reconocible"
                    ) : (
                      <span className="text-red-400">No parece una URL de YouTube</span>
                    )}
                  </p>
                </Field>
                <Field label="Descripción">
                  <Textarea
                    rows={4}
                    value={draft.description}
                    onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Qué publica este canal…"
                  />
                </Field>
                <Field label="Video destacado (opcional)" hint="Si se indica, la tarjeta reproduce este video en vez de la lista de subidas.">
                  <Input
                    type="url"
                    inputMode="url"
                    value={draft.featuredVideoUrl}
                    onChange={(e) => setDraft((p) => ({ ...p, featuredVideoUrl: e.target.value }))}
                    placeholder="https://youtu.be/…"
                  />
                  {draft.featuredVideoUrl.trim() ? (
                    <p className="font-mono text-[11px] text-[var(--text-muted)]">
                      {featuredVideoId ? (
                        <>
                          videoId: <span className="text-primary">{featuredVideoId}</span>
                        </>
                      ) : (
                        <span className="text-red-400">No se reconoce el video</span>
                      )}
                    </p>
                  ) : null}
                </Field>
              </div>

              <div className="space-y-4">
                <ImageUploadField
                  label="Avatar"
                  aspect="square"
                  value={draft.avatarUrl}
                  onChange={(next) => setDraft((p) => ({ ...p, avatarUrl: next }))}
                  hint="Cuadrado, mínimo 160×160. Si se deja vacío se usa la inicial del nombre."
                  disabled={busy}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Categoría">
                    <Input
                      list="admin-channel-categories"
                      value={draft.category}
                      onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                      placeholder="Crew, Artista, Sello, Aliado…"
                      maxLength={40}
                    />
                    <datalist id="admin-channel-categories">
                      {categoryOptions.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </Field>
                  <Field label="Estado">
                    <select
                      className={nativeSelectClass}
                      value={draft.status}
                      onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as ChannelStatus }))}
                    >
                      <option value="ACTIVE">Activo (visible)</option>
                      <option value="HIDDEN">Oculto</option>
                    </select>
                  </Field>
                </div>
                <Field label="Destacado">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={draft.featured} onCheckedChange={(v) => setDraft((p) => ({ ...p, featured: v === true }))} />
                    Mostrar en el bloque de canales del inicio
                  </label>
                </Field>

                <div className="flex flex-wrap gap-2 pt-2 md:justify-end">
                  <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" disabled={busy} onClick={() => void onSave()}>
                    {saving ? "Guardando…" : "Guardar"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && !deleteBusy && setDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-background-card">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar este canal?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{deleteTarget?.name ?? ""}» de la lista de canales. Esta acción no se puede deshacer. Si solo
              quieres ocultarlo, cámbialo a «Oculto».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancelar</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={deleteBusy} onClick={() => void confirmDelete()}>
              {deleteBusy ? "Borrando…" : "Borrar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-[var(--text-secondary)]">{label}</Label>
      {children}
      {hint ? <p className="text-[11px] text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}
