"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Search, Star, Trash2, Youtube } from "lucide-react";
import { toast } from "sonner";
import type { ChannelStatus, YoutubeChannel } from "@/types/models";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { isYoutubeUrl, parseYoutubeChannelId, parseYoutubeVideoId } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import { AdminTable, AdminTableActions, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "@/components/ds/admin-table";
import { EmptyState } from "@/components/ds/empty-state";
import { Pagination } from "@/components/ds/pagination";
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
  AdminField,
  AdminModuleToolbar,
  AdminNativeSelect,
  AdminResultsBar,
  RowAction,
  adminDialogClass,
} from "@/features/admin/components/admin-primitives";
import {
  createChannelAction,
  deleteChannelAction,
  moveChannelAction,
  patchChannelAction,
} from "@/app/actions/admin-channels-actions";

export const ADMIN_CHANNELS_PAGE_SIZE = 20;

const STATUS_META: Record<ChannelStatus, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: "Activo", tone: "success" },
  HIDDEN: { label: "Oculto", tone: "neutral" },
};

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

  const filtered = Boolean(query || status);

  return (
    <div className="space-y-4">
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
                placeholder="Buscar por nombre, @handle, URL…"
                aria-label="Buscar canales"
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
            <Label htmlFor="admin-channels-status" className="shrink-0">
              Estado
            </Label>
            <AdminNativeSelect id="admin-channels-status" className="w-auto min-w-36" value={status} disabled={navPending} onChange={(e) => navigate({ status: e.target.value, page: 1 })}>
              <option value="">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="HIDDEN">Ocultos</option>
            </AdminNativeSelect>
          </div>
        }
        summary={`${total} ${total === 1 ? "canal" : "canales"}`}
        action={
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus aria-hidden /> Nuevo canal
          </Button>
        }
      />

      {items.length === 0 ? (
        filtered ? (
          <EmptyState icon={Search} title="Sin resultados" description="No hay canales que coincidan con el filtro. Prueba con otro texto o estado." />
        ) : (
          <EmptyState
            icon={Youtube}
            title="Aún no hay canales"
            description="Añade el primero con su URL de YouTube: se mostrará en el inicio (si es destacado) y en /canales."
            action={
              <Button type="button" onClick={openCreate}>
                <Plus aria-hidden /> Nuevo canal
              </Button>
            }
          />
        )
      ) : (
        <div className={cn("scroll-fade-x overflow-x-auto transition-opacity duration-150 md:[mask-image:none]", navPending && "opacity-60")} aria-busy={navPending}>
          <AdminTable>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeader>Canal</AdminTableHeader>
                <AdminTableHeader>Categoría</AdminTableHeader>
                <AdminTableHeader>Destacado</AdminTableHeader>
                <AdminTableHeader>Estado</AdminTableHeader>
                <AdminTableHeader>Orden</AdminTableHeader>
                <AdminTableHeader align="right">
                  <span className="sr-only">Acciones</span>
                </AdminTableHeader>
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {items.map((ch, i) => {
                const meta = STATUS_META[ch.status] ?? STATUS_META.HIDDEN;
                const isBusy = rowBusy === ch.id;
                const avatar = ch.avatarUrl?.trim() ? resolveMediaUrl(ch.avatarUrl) : null;
                return (
                  <AdminTableRow key={ch.id} className={cn(isBusy && "opacity-60", ch.status === "HIDDEN" && "opacity-80")}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={ch.name} src={avatar} size={40} />
                        <div className="min-w-0 max-w-[280px]">
                          <p className="truncate font-semibold">{ch.name}</p>
                          <p className="truncate font-mono text-body-sm text-text-3" title={ch.url}>
                            {ch.handle ? `@${ch.handle}` : ch.channelId ?? ch.url}
                          </p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>{ch.category}</AdminTableCell>
                    <AdminTableCell>
                      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-body-sm">
                        <Checkbox checked={ch.featured} disabled={isBusy} aria-label={ch.featured ? "Quitar destacado" : "Marcar destacado"} onCheckedChange={() => void toggleFeatured(ch)} />
                        {ch.featured ? (
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
                        <span className="w-6 font-mono text-body-sm tabular-nums text-text-2">{ch.sortOrder}</span>
                        <RowAction label={`Subir ${ch.name}`} disabled={i === 0 || isBusy || rowBusy !== null} onClick={() => void move(i, "up")}>
                          <ArrowUp />
                        </RowAction>
                        <RowAction label={`Bajar ${ch.name}`} disabled={i === items.length - 1 || isBusy || rowBusy !== null} onClick={() => void move(i, "down")}>
                          <ArrowDown />
                        </RowAction>
                      </div>
                    </AdminTableCell>
                    <AdminTableActions>
                      <RowAction label="Abrir en YouTube" asChild>
                        <a href={ch.url} target="_blank" rel="noopener noreferrer">
                          <Youtube />
                        </a>
                      </RowAction>
                      <RowAction label="Editar" onClick={() => openEdit(ch)}>
                        <Pencil />
                      </RowAction>
                      <RowAction label="Borrar" className="hover:text-danger" onClick={() => setDeleteTarget(ch)}>
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

      <AdminResultsBar summary={`${total} ${total === 1 ? "canal" : "canales"} · Página ${Math.min(page, totalPages)} de ${totalPages}`}>
        <Pagination page={page} pageCount={totalPages} hrefFor={(p) => buildAdminHref({ q: query, status, page: p })} />
      </AdminResultsBar>

      <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <DialogContent className={cn(adminDialogClass, "max-w-3xl")}>
          <DialogHeader>
            <DialogTitle className="text-title">{mode === "create" ? "Crear canal" : "Editar canal"}</DialogTitle>
            <DialogDescription>Nombre y URL de YouTube son obligatorios. El channelId o el @handle se detectan solos.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <AdminField label="Nombre">
                <Input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Sodimusic" />
              </AdminField>
              <AdminField label="URL del canal" hint="Se autodetecta el channelId (UC…) o el @handle.">
                <Input type="url" inputMode="url" value={draft.url} onChange={(e) => setDraft((p) => ({ ...p, url: e.target.value }))} placeholder="https://www.youtube.com/@sodimusic" />
                <p className="font-mono text-body-sm text-text-3" aria-live="polite">
                  {!draft.url.trim() ? (
                    "Sin URL"
                  ) : detected.channelId ? (
                    <>
                      channelId: <span className="text-fire-400">{detected.channelId}</span> · lista de subidas disponible
                    </>
                  ) : detected.handle ? (
                    <>
                      handle: <span className="text-fire-400">@{detected.handle}</span> · sin channelId: añade un video destacado para el embed
                    </>
                  ) : isYoutubeUrl(draft.url) ? (
                    "URL de YouTube sin canal reconocible"
                  ) : (
                    <span className="text-danger">No parece una URL de YouTube</span>
                  )}
                </p>
              </AdminField>
              <AdminField label="Descripción">
                <Textarea rows={4} value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Qué publica este canal…" />
              </AdminField>
              <AdminField label="Video destacado (opcional)" hint="Si se indica, la tarjeta reproduce este video en vez de la lista de subidas.">
                <Input type="url" inputMode="url" value={draft.featuredVideoUrl} onChange={(e) => setDraft((p) => ({ ...p, featuredVideoUrl: e.target.value }))} placeholder="https://youtu.be/…" />
                {draft.featuredVideoUrl.trim() ? (
                  <p className="font-mono text-body-sm text-text-3">
                    {featuredVideoId ? (
                      <>
                        videoId: <span className="text-fire-400">{featuredVideoId}</span>
                      </>
                    ) : (
                      <span className="text-danger">No se reconoce el video</span>
                    )}
                  </p>
                ) : null}
              </AdminField>
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
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Categoría">
                  <Input list="admin-channel-categories" value={draft.category} onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))} placeholder="Crew, Artista, Sello, Aliado…" maxLength={40} />
                  <datalist id="admin-channel-categories">
                    {categoryOptions.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </AdminField>
                <AdminField label="Estado">
                  <AdminNativeSelect value={draft.status} onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as ChannelStatus }))}>
                    <option value="ACTIVE">Activo (visible)</option>
                    <option value="HIDDEN">Oculto</option>
                  </AdminNativeSelect>
                </AdminField>
              </div>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-1">
                <Checkbox checked={draft.featured} onCheckedChange={(v) => setDraft((p) => ({ ...p, featured: v === true }))} />
                Destacado: mostrar en el bloque de canales del inicio
              </label>
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
            <AlertDialogTitle className="text-title">¿Borrar este canal?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{deleteTarget?.name ?? ""}» de la lista de canales. Esta acción no se puede deshacer. Si solo quieres ocultarlo, cámbialo a «Oculto».
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
