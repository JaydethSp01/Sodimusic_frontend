"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { LayoutGrid, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import type { Production } from "@/types/models";
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
import { Input } from "@/components/ui/input";
import { uploadAdminFile } from "@/app/actions/admin-upload";
import { createProductionAction, deleteProductionAction, patchProductionAction } from "@/app/actions/admin-productions-actions";
import {
  AdminDialogFooter,
  AdminField,
  AdminModuleToolbar,
  AdminResultsBar,
  RowAction,
  adminDialogClass,
} from "@/features/admin/components/admin-primitives";
import { cn } from "@/lib/utils";

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

type FeaturedFilter = "ALL" | "FEATURED";

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

const fileInputClass =
  "block w-full cursor-pointer text-body-sm text-text-2 file:mr-3 file:cursor-pointer file:rounded file:border file:border-line-2 file:bg-ink-3 file:px-3 file:py-2 file:text-body-sm file:font-medium file:text-text-1";

export function AdminProductionsManager({ initialItems }: { initialItems: Production[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductionDraft>(() => emptyDraft());
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Production | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FeaturedFilter>("ALL");

  const coverPreview = useMemo(() => (draft.coverUrl ? resolveMediaUrl(draft.coverUrl) : null), [draft.coverUrl]);

  /* Filtro solo de presentación (no toca datos ni URL). */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialItems.filter((p) => {
      if (filter === "FEATURED" && !p.featured) return false;
      if (!q) return true;
      return [p.title, p.artistName, p.genre, String(p.year)].some((s) => s.toLowerCase().includes(q));
    });
  }, [initialItems, query, filter]);

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

  async function confirmDeleteProduction() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    try {
      const r = await deleteProductionAction(deleteTarget.id);
      if (!r.ok) {
        toast.error(r.error ?? "Error al borrar");
        return;
      }
      toast.success("Producción borrada");
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
            <Input type="search" aria-label="Buscar producciones" placeholder="Buscar por título, artista, género o año…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
          </div>
        }
        filters={
          <div role="group" aria-label="Filtrar producciones" className="flex flex-wrap gap-2">
            <Chip selected={filter === "ALL"} onClick={() => setFilter("ALL")}>
              Todas
            </Chip>
            <Chip selected={filter === "FEATURED"} onClick={() => setFilter("FEATURED")} count={initialItems.filter((p) => p.featured).length}>
              Destacadas
            </Chip>
          </div>
        }
        summary={`${visible.length} de ${initialItems.length}`}
        action={
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus aria-hidden /> Nueva producción
          </Button>
        }
      />

      {initialItems.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="Aún no hay producciones"
          description="Añade la primera con su portada y enlace de YouTube: aparecerá en /productions."
          action={
            <Button type="button" onClick={openCreate}>
              <Plus aria-hidden /> Nueva producción
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
                <AdminTableHeader>Producción</AdminTableHeader>
                <AdminTableHeader>Artista</AdminTableHeader>
                <AdminTableHeader align="right">Año</AdminTableHeader>
                <AdminTableHeader>Género</AdminTableHeader>
                <AdminTableHeader>Destacado</AdminTableHeader>
                <AdminTableHeader align="right">
                  <span className="sr-only">Acciones</span>
                </AdminTableHeader>
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {visible.map((p) => (
                <AdminTableRow key={p.id}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={p.title} src={p.coverUrl ? resolveMediaUrl(p.coverUrl) : null} size={40} square />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p.title}</p>
                        <p className="truncate text-body-sm text-text-3">
                          {p.artistCity}, {p.artistCountry}
                        </p>
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>{p.artistName}</AdminTableCell>
                  <AdminTableCell mono align="right">
                    {p.year}
                  </AdminTableCell>
                  <AdminTableCell>
                    <Badge tone="fire" variant="outline">
                      {p.genre}
                    </Badge>
                  </AdminTableCell>
                  <AdminTableCell>
                    {p.featured ? (
                      <Badge tone="gold" icon={<Star aria-hidden />}>
                        Sí
                      </Badge>
                    ) : (
                      <span className="text-text-3">No</span>
                    )}
                  </AdminTableCell>
                  <AdminTableActions>
                    <RowAction label="Editar" onClick={() => openEdit(p)}>
                      <Pencil />
                    </RowAction>
                    <RowAction label="Borrar" className="hover:text-danger" onClick={() => setDeleteTarget(p)}>
                      <Trash2 />
                    </RowAction>
                  </AdminTableActions>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        </div>
      )}
      <AdminResultsBar summary={initialItems.length ? `${initialItems.length} ${initialItems.length === 1 ? "producción" : "producciones"} en el portafolio` : undefined} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={cn(adminDialogClass, "max-w-3xl")}>
          <DialogHeader>
            <DialogTitle className="text-title">{mode === "create" ? "Crear producción" : "Editar producción"}</DialogTitle>
            <DialogDescription>Título, artista, ciudad, país, año y género son obligatorios.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <AdminField label="Título">
                <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
              </AdminField>
              <AdminField label="Artista">
                <Input value={draft.artistName} onChange={(e) => setDraft((p) => ({ ...p, artistName: e.target.value }))} />
              </AdminField>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Ciudad">
                  <Input value={draft.artistCity} onChange={(e) => setDraft((p) => ({ ...p, artistCity: e.target.value }))} />
                </AdminField>
                <AdminField label="País">
                  <Input value={draft.artistCountry} onChange={(e) => setDraft((p) => ({ ...p, artistCountry: e.target.value }))} />
                </AdminField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Año">
                  <Input type="number" value={draft.year} onChange={(e) => setDraft((p) => ({ ...p, year: Number(e.target.value) || new Date().getFullYear() }))} />
                </AdminField>
                <AdminField label="Género">
                  <Input value={draft.genre} onChange={(e) => setDraft((p) => ({ ...p, genre: e.target.value }))} />
                </AdminField>
              </div>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-1">
                <Checkbox checked={draft.featured} onCheckedChange={(v) => setDraft((p) => ({ ...p, featured: v === true }))} />
                Destacada: mostrar en el inicio
              </label>
            </div>

            <div className="space-y-4">
              <AdminField label="Portada (coverUrl)" hint="JPG, PNG o WebP. Cuadrada, mínimo 600 px.">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="Previsualización de la portada" className="h-32 w-full rounded border border-line-1 object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded border border-dashed border-line-2 bg-ink-1 text-text-3">
                    <LayoutGrid className="h-6 w-6" strokeWidth={1.5} aria-hidden />
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
              <AdminField label="Spotify URL (opcional)">
                <Input type="url" inputMode="url" placeholder="https://open.spotify.com/…" value={draft.spotifyUrl ?? ""} onChange={(e) => setDraft((p) => ({ ...p, spotifyUrl: normalizeMaybeUrl(e.target.value) }))} />
              </AdminField>
              <AdminField label="YouTube URL (opcional)" hint="Si hay video, la tarjeta pública lo reproduce.">
                <Input type="url" inputMode="url" placeholder="https://www.youtube.com/watch?v=…" value={draft.youtubeUrl ?? ""} onChange={(e) => setDraft((p) => ({ ...p, youtubeUrl: normalizeMaybeUrl(e.target.value) }))} />
              </AdminField>
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
            <AlertDialogTitle className="text-title">¿Borrar esta producción?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminará «{deleteTarget?.title ?? ""}». Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancelar</AlertDialogCancel>
            <Button type="button" variant="danger" loading={deleteBusy} onClick={() => void confirmDeleteProduction()}>
              Borrar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
