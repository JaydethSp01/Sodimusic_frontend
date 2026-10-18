"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Pencil, Plus, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductStatus } from "@/types/models";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { cn } from "@/lib/utils";
import { AdminTable, AdminTableActions, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "@/components/ds/admin-table";
import { EmptyState } from "@/components/ds/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
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
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadAdminFile } from "@/app/actions/admin-upload";
import { createProductAction, deleteProductAction, patchProductAction } from "@/app/actions/admin-products-actions";
import {
  AdminDialogFooter,
  AdminField,
  AdminModuleToolbar,
  AdminNativeSelect,
  AdminResultsBar,
  RowAction,
  adminDialogClass,
} from "@/features/admin/components/admin-primitives";

const MAX_IMAGES = 8;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;

const STATUS_META: Record<ProductStatus, { label: string; tone: BadgeTone }> = {
  ACTIVE: { label: "Activo", tone: "success" },
  DRAFT: { label: "Borrador", tone: "neutral" },
  SOLD_OUT: { label: "Agotado", tone: "danger" },
};

const STATUS_FILTERS: { value: ProductStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "ACTIVE", label: "Activos" },
  { value: "DRAFT", label: "Borradores" },
  { value: "SOLD_OUT", label: "Agotados" },
];

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCOP(value: number): string {
  return copFormatter.format(Number.isFinite(value) ? value : 0);
}

/** minúsculas, sin acentos, guiones */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type ProductDraft = {
  name: string;
  slug: string;
  description: string;
  priceCOP: number;
  compareAtCOP: string;
  category: string;
  sizesText: string;
  stock: string;
  status: ProductStatus;
  featured: boolean;
  sortOrder: number;
  images: string[];
};

const emptyDraft = (): ProductDraft => ({
  name: "",
  slug: "",
  description: "",
  priceCOP: 0,
  compareAtCOP: "",
  category: "",
  sizesText: "",
  stock: "",
  status: "DRAFT",
  featured: false,
  sortOrder: 0,
  images: [],
});

function draftFromRow(row: Product): ProductDraft {
  return {
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    priceCOP: row.priceCOP,
    compareAtCOP: row.compareAtCOP === null || row.compareAtCOP === undefined ? "" : String(row.compareAtCOP),
    category: row.category,
    sizesText: (row.sizes ?? []).join(", "),
    stock: row.stock === null || row.stock === undefined ? "" : String(row.stock),
    status: row.status,
    featured: row.featured,
    sortOrder: row.sortOrder ?? 0,
    images: [...(row.images ?? [])],
  };
}

function parseOptionalInt(v: string): number | null {
  const s = v.trim();
  if (!s.length) return null;
  const n = Number(s);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
}

function parseSizes(v: string): string[] {
  const seen = new Set<string>();
  return v
    .split(",")
    .map((x) => x.trim())
    .filter((x) => {
      if (!x.length || seen.has(x)) return false;
      seen.add(x);
      return true;
    });
}

export function AdminProductsManager({ initialItems }: { initialItems: Product[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(() => emptyDraft());
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "ALL">("ALL");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of initialItems) {
      const c = p.category?.trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [initialItems]);

  const sortedItems = useMemo(
    () =>
      [...initialItems].sort((a, b) => {
        if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        return a.name.localeCompare(b.name, "es");
      }),
    [initialItems],
  );

  /* Filtro solo de presentación (no toca datos ni URL). */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedItems.filter((p) => {
      if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
      if (!q) return true;
      return [p.name, p.slug, p.category].some((s) => s.toLowerCase().includes(q));
    });
  }, [sortedItems, query, statusFilter]);

  const uploading = uploadProgress !== null;
  const busy = saving || uploading;

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setDraft(emptyDraft());
    setSlugTouched(false);
    setNewImageUrl("");
    setOpen(true);
  }

  function openEdit(row: Product) {
    setMode("edit");
    setEditingId(row.id);
    setDraft(draftFromRow(row));
    setSlugTouched(true);
    setNewImageUrl("");
    setOpen(true);
  }

  function onNameChange(value: string) {
    setDraft((p) => ({
      ...p,
      name: value,
      slug: slugTouched ? p.slug : slugify(value),
    }));
  }

  function onSlugChange(value: string) {
    setSlugTouched(true);
    setDraft((p) => ({ ...p, slug: slugify(value) || value.toLowerCase() }));
  }

  function addImageUrl() {
    const url = newImageUrl.trim();
    if (!url.length) return;
    if (draft.images.length >= MAX_IMAGES) {
      toast.error(`Máximo ${MAX_IMAGES} imágenes por producto`);
      return;
    }
    if (draft.images.includes(url)) {
      toast.error("Esa imagen ya está en la lista");
      return;
    }
    setDraft((p) => ({ ...p, images: [...p.images, url] }));
    setNewImageUrl("");
  }

  function moveImage(index: number, dir: -1 | 1) {
    setDraft((p) => {
      const next = [...p.images];
      const target = index + dir;
      if (target < 0 || target >= next.length) return p;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...p, images: next };
    });
  }

  function removeImage(index: number) {
    setDraft((p) => ({ ...p, images: p.images.filter((_, i) => i !== index) }));
  }

  async function onUploadFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;

    const room = MAX_IMAGES - draft.images.length;
    if (room <= 0) {
      toast.error(`Máximo ${MAX_IMAGES} imágenes por producto`);
      return;
    }
    const selected = files.slice(0, room);
    if (selected.length < files.length) {
      toast.warning(`Solo se subirán ${selected.length} de ${files.length} (máximo ${MAX_IMAGES} imágenes)`);
    }

    setUploadProgress({ current: 0, total: selected.length });
    let uploaded = 0;
    try {
      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        setUploadProgress({ current: i + 1, total: selected.length });
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          toast.error(`«${file.name}»: formato no admitido (usa JPG, PNG, WebP o GIF)`);
          continue;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          toast.error(`«${file.name}» supera los 4,5 MB`);
          continue;
        }
        const fd = new FormData();
        fd.append("file", file);
        const r = await uploadAdminFile(fd);
        if (!r.ok || !r.url) {
          toast.error(r.error ?? `No se pudo subir «${file.name}»`);
          continue;
        }
        const url = r.url;
        setDraft((p) => (p.images.length >= MAX_IMAGES || p.images.includes(url) ? p : { ...p, images: [...p.images, url] }));
        uploaded++;
      }
      if (uploaded > 0) {
        toast.success(uploaded === 1 ? "Imagen subida" : `${uploaded} imágenes subidas`);
      }
    } finally {
      setUploadProgress(null);
    }
  }

  function buildPayload() {
    const sizes = parseSizes(draft.sizesText);
    const compareAt = parseOptionalInt(draft.compareAtCOP);
    const stock = parseOptionalInt(draft.stock);
    const description = draft.description.trim();
    return {
      name: draft.name.trim(),
      slug: draft.slug.trim() || slugify(draft.name),
      description: description.length ? description : null,
      priceCOP: Math.max(0, Math.round(draft.priceCOP)),
      compareAtCOP: compareAt,
      category: draft.category.trim(),
      images: draft.images,
      sizes,
      stock,
      status: draft.status,
      featured: draft.featured,
      sortOrder: Number.isFinite(draft.sortOrder) ? Math.round(draft.sortOrder) : 0,
    };
  }

  async function onSave() {
    if (busy) return;
    if (!draft.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!draft.category.trim()) {
      toast.error("La categoría es obligatoria");
      return;
    }
    if (!Number.isFinite(draft.priceCOP) || draft.priceCOP <= 0) {
      toast.error("Indica un precio COP mayor que 0");
      return;
    }
    const compareAt = parseOptionalInt(draft.compareAtCOP);
    if (compareAt !== null && compareAt <= draft.priceCOP) {
      toast.error("El precio anterior debe ser mayor que el precio actual");
      return;
    }
    if (draft.status === "ACTIVE" && draft.images.length === 0) {
      toast.error("Añade al menos una imagen antes de activar el producto");
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload();
      if (mode === "create") {
        const r = await createProductAction(payload);
        if (!r.ok) {
          toast.error(r.error ?? "Error al crear producto");
          return;
        }
      } else if (mode === "edit" && editingId) {
        const r = await patchProductAction(editingId, payload);
        if (!r.ok) {
          toast.error(r.error ?? "Error al editar producto");
          return;
        }
      }
      toast.success(mode === "create" ? "Producto creado" : "Producto actualizado");
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
      const r = await deleteProductAction(deleteTarget.id);
      if (!r.ok) {
        toast.error(r.error ?? "Error al borrar");
        return;
      }
      toast.success("Producto borrado");
      setDeleteTarget(null);
      router.refresh();
    } finally {
      setDeleteBusy(false);
    }
  }

  async function toggleFeatured(row: Product) {
    const r = await patchProductAction(row.id, { featured: !row.featured });
    if (!r.ok) {
      toast.error(r.error ?? "No se pudo actualizar");
      return;
    }
    toast.success(!row.featured ? "Marcado como destacado" : "Ya no es destacado");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <AdminModuleToolbar
        search={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" aria-hidden />
            <Input type="search" aria-label="Buscar productos" placeholder="Buscar por nombre, slug o categoría…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
          </div>
        }
        filters={
          <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <Chip key={f.value} selected={statusFilter === f.value} onClick={() => setStatusFilter(f.value)}>
                {f.label}
              </Chip>
            ))}
          </div>
        }
        summary={`${visible.length} de ${initialItems.length}`}
        action={
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus aria-hidden /> Nuevo producto
          </Button>
        }
      />

      {initialItems.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Aún no hay productos"
          description="Crea el primero con imágenes, precio y tallas. Los textos de la página se editan en «Sitio web → Tienda»."
          action={
            <Button type="button" onClick={openCreate}>
              <Plus aria-hidden /> Nuevo producto
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState icon={Search} title="Sin resultados" description="Prueba con otro texto o quita el filtro de estado." />
      ) : (
        <div className="scroll-fade-x overflow-x-auto md:[mask-image:none]">
          <AdminTable>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeader>Producto</AdminTableHeader>
                <AdminTableHeader>Categoría</AdminTableHeader>
                <AdminTableHeader align="right">Precio</AdminTableHeader>
                <AdminTableHeader align="right">Stock</AdminTableHeader>
                <AdminTableHeader>Estado</AdminTableHeader>
                <AdminTableHeader>Destacado</AdminTableHeader>
                <AdminTableHeader align="right">Orden</AdminTableHeader>
                <AdminTableHeader align="right">
                  <span className="sr-only">Acciones</span>
                </AdminTableHeader>
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {visible.map((p) => {
                const cover = p.images?.[0] ? resolveMediaUrl(p.images[0]) : null;
                const meta = STATUS_META[p.status] ?? STATUS_META.DRAFT;
                return (
                  <AdminTableRow key={p.id} className={cn(p.status === "DRAFT" && "opacity-80")}>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={p.name} src={cover} size={40} square />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{p.name}</p>
                          <p className="truncate font-mono text-body-sm text-text-3">/{p.slug}</p>
                        </div>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>{p.category}</AdminTableCell>
                    <AdminTableCell mono align="right" className="whitespace-nowrap">
                      <span className="text-text-1">{formatCOP(p.priceCOP)}</span>
                      {p.compareAtCOP ? <span className="block text-label-sm text-text-3 line-through">{formatCOP(p.compareAtCOP)}</span> : null}
                    </AdminTableCell>
                    <AdminTableCell mono align="right">
                      {p.stock === null || p.stock === undefined ? <span className="text-text-3">Sin control</span> : <span className={cn(p.stock === 0 && "text-danger")}>{p.stock}</span>}
                    </AdminTableCell>
                    <AdminTableCell>
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                    </AdminTableCell>
                    <AdminTableCell>
                      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-body-sm">
                        <Checkbox checked={p.featured} aria-label={p.featured ? "Quitar destacado" : "Marcar destacado"} onCheckedChange={() => void toggleFeatured(p)} />
                        <span className="text-text-3">{p.featured ? "Sí" : "No"}</span>
                      </label>
                    </AdminTableCell>
                    <AdminTableCell mono align="right">
                      {p.sortOrder ?? 0}
                    </AdminTableCell>
                    <AdminTableActions>
                      {p.status === "ACTIVE" ? (
                        <RowAction label="Ver en la tienda" asChild>
                          <a href={`/tienda/${p.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink />
                          </a>
                        </RowAction>
                      ) : null}
                      <RowAction label="Editar" onClick={() => openEdit(p)}>
                        <Pencil />
                      </RowAction>
                      <RowAction label="Borrar" className="hover:text-danger" onClick={() => setDeleteTarget(p)}>
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
      <AdminResultsBar summary={initialItems.length ? `${initialItems.length} ${initialItems.length === 1 ? "producto" : "productos"} en la tienda` : undefined} />

      <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
        <DialogContent className={cn(adminDialogClass, "max-w-4xl")}>
          <DialogHeader>
            <DialogTitle className="text-title">{mode === "create" ? "Crear producto" : "Editar producto"}</DialogTitle>
            <DialogDescription>Nombre, categoría y precio son obligatorios. Un producto activo necesita al menos una imagen.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <AdminField label="Nombre">
                <Input value={draft.name} onChange={(e) => onNameChange(e.target.value)} placeholder="Camiseta Sodimusic" />
              </AdminField>
              <AdminField label="Slug (URL)" hint="Se sugiere desde el nombre; puedes editarlo.">
                <div className="flex items-center gap-2">
                  <span className="shrink-0 font-mono text-body-sm text-text-3">/tienda/</span>
                  <Input value={draft.slug} onChange={(e) => onSlugChange(e.target.value)} placeholder="camiseta-sodimusic" />
                </div>
              </AdminField>
              <AdminField label="Descripción">
                <Textarea rows={4} value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Material, corte, detalles del diseño…" />
              </AdminField>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Precio COP" hint={formatCOP(draft.priceCOP)}>
                  <Input type="number" min={0} step={1000} value={draft.priceCOP} onChange={(e) => setDraft((p) => ({ ...p, priceCOP: Number(e.target.value) || 0 }))} />
                </AdminField>
                <AdminField label="Precio anterior (opcional)" hint="Se muestra tachado.">
                  <Input type="number" min={0} step={1000} value={draft.compareAtCOP} onChange={(e) => setDraft((p) => ({ ...p, compareAtCOP: e.target.value }))} placeholder="Vacío = sin descuento" />
                </AdminField>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Categoría">
                  <Input list="admin-product-categories" value={draft.category} onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))} placeholder="Camisetas, Gorras…" />
                  <datalist id="admin-product-categories">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </AdminField>
                <AdminField label="Tallas (separadas por coma)">
                  <Input value={draft.sizesText} onChange={(e) => setDraft((p) => ({ ...p, sizesText: e.target.value }))} placeholder="S, M, L, XL" />
                </AdminField>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <AdminField label="Stock" hint="Vacío = sin control.">
                  <Input type="number" min={0} value={draft.stock} onChange={(e) => setDraft((p) => ({ ...p, stock: e.target.value }))} placeholder="∞" />
                </AdminField>
                <AdminField label="Estado">
                  <AdminNativeSelect value={draft.status} onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as ProductStatus }))}>
                    <option value="ACTIVE">Activo (visible)</option>
                    <option value="DRAFT">Borrador (oculto)</option>
                    <option value="SOLD_OUT">Agotado</option>
                  </AdminNativeSelect>
                </AdminField>
                <AdminField label="Orden" hint="Menor = primero.">
                  <Input type="number" value={draft.sortOrder} onChange={(e) => setDraft((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))} />
                </AdminField>
              </div>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-1">
                <Checkbox checked={draft.featured} onCheckedChange={(v) => setDraft((p) => ({ ...p, featured: v === true }))} />
                Destacado: mostrar en el bloque de tienda del inicio
              </label>
            </div>

            <div className="space-y-4">
              <AdminField label={`Imágenes (${draft.images.length}/${MAX_IMAGES})`} hint="La primera es la portada. Reordena con las flechas.">
                {draft.images.length === 0 ? (
                  <div className="flex h-28 flex-col items-center justify-center gap-1 rounded border border-dashed border-line-2 bg-ink-1 text-text-3">
                    <ImagePlus className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                    <span className="text-body-sm">Sin imágenes todavía</span>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {draft.images.map((url, i) => (
                      <li key={`${url}-${i}`} className="flex items-center gap-3 rounded border border-line-1 bg-ink-1 p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={resolveMediaUrl(url)} alt="" className="h-14 w-14 shrink-0 rounded border border-line-1 object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-body-sm text-text-2" title={url}>
                            {url}
                          </p>
                          {i === 0 ? (
                            <Badge tone="fire" className="mt-1">
                              Portada
                            </Badge>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          <IconButton size="sm" variant="ghost" aria-label="Subir" disabled={i === 0 || busy} onClick={() => moveImage(i, -1)}>
                            <ArrowUp />
                          </IconButton>
                          <IconButton size="sm" variant="ghost" aria-label="Bajar" disabled={i === draft.images.length - 1 || busy} onClick={() => moveImage(i, 1)}>
                            <ArrowDown />
                          </IconButton>
                          <IconButton size="sm" variant="ghost" className="hover:text-danger" aria-label="Quitar" disabled={busy} onClick={() => removeImage(i)}>
                            <X />
                          </IconButton>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex gap-2">
                  <Input
                    value={newImageUrl}
                    aria-label="URL de imagen"
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addImageUrl();
                      }
                    }}
                    placeholder="https://… o /uploads/…"
                    disabled={busy || draft.images.length >= MAX_IMAGES}
                  />
                  <Button type="button" variant="outline" disabled={busy || !newImageUrl.trim() || draft.images.length >= MAX_IMAGES} onClick={addImageUrl}>
                    Añadir URL
                  </Button>
                </div>

                <div className="flex flex-col gap-2">
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" aria-label="Subir imágenes del producto" onChange={(e) => void onUploadFiles(e)} />
                  <Button type="button" variant="secondary" loading={uploading} disabled={busy || draft.images.length >= MAX_IMAGES} onClick={() => fileInputRef.current?.click()}>
                    {uploading ? null : <ImagePlus aria-hidden />}
                    {uploadProgress ? `Subiendo ${uploadProgress.current}/${uploadProgress.total}…` : "Subir imágenes"}
                  </Button>
                  <p className="text-body-sm text-text-3">JPG, PNG, WebP o GIF · máximo 4,5 MB cada una.</p>
                </div>
              </AdminField>
            </div>
          </div>

          <AdminDialogFooter>
            <Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" loading={saving} disabled={uploading} onClick={() => void onSave()}>
              Guardar
            </Button>
          </AdminDialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && !deleteBusy && setDeleteTarget(null)}>
        <AlertDialogContent className={adminDialogClass}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-title">¿Borrar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{deleteTarget?.name ?? ""}» de la tienda. Esta acción no se puede deshacer. Si solo quieres ocultarlo, cámbialo a «Borrador».
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
