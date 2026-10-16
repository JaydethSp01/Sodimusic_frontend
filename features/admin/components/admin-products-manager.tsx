"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import type { Product, ProductStatus } from "@/types/models";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
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
import { uploadAdminFile } from "@/app/actions/admin-upload";
import { createProductAction, deleteProductAction, patchProductAction } from "@/app/actions/admin-products-actions";

const MAX_IMAGES = 8;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_UPLOAD_BYTES = 4.5 * 1024 * 1024;

const STATUS_META: Record<ProductStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Activo", className: "border-transparent bg-primary-muted text-primary" },
  DRAFT: { label: "Borrador", className: "border-transparent bg-background-elevated text-[var(--text-secondary)]" },
  SOLD_OUT: { label: "Agotado", className: "border-red-500/30 bg-red-500/10 text-red-400" },
};

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

const nativeSelectClass =
  "flex h-10 w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

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
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="font-display text-xl">Tienda</CardTitle>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Productos del marketplace: imágenes, precio, tallas, stock y estado. Los textos de la página se editan en
              «Sitio web → Tienda».
            </p>
          </div>
          <Button type="button" onClick={openCreate}>
            Nuevo producto
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Destacado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedItems.map((p) => {
                  const cover = p.images?.[0] ? resolveMediaUrl(p.images[0]) : null;
                  const meta = STATUS_META[p.status] ?? STATUS_META.DRAFT;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover}
                            alt=""
                            className="h-12 w-12 rounded-md border border-border object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-border text-[var(--text-muted)]">
                            <ImagePlus className="h-4 w-4" aria-hidden />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{p.name}</span>
                          <span className="font-mono text-[11px] text-[var(--text-muted)]">/{p.slug}</span>
                        </div>
                      </TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell className="whitespace-nowrap font-mono text-xs">
                        <div className="flex flex-col">
                          <span>{formatCOP(p.priceCOP)}</span>
                          {p.compareAtCOP ? (
                            <span className="text-[var(--text-muted)] line-through">{formatCOP(p.compareAtCOP)}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {p.stock === null || p.stock === undefined ? (
                          <span className="text-[var(--text-muted)]">Sin control</span>
                        ) : (
                          <span className={cn(p.stock === 0 && "text-red-400")}>{p.stock}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={meta.className}>{meta.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <label className="flex items-center gap-2 text-xs">
                          <Checkbox
                            checked={p.featured}
                            aria-label={p.featured ? "Quitar destacado" : "Marcar destacado"}
                            onCheckedChange={() => void toggleFeatured(p)}
                          />
                          <span className="text-[var(--text-muted)]">{p.featured ? "Sí" : "No"}</span>
                        </label>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.sortOrder ?? 0}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => openEdit(p)}>
                            Editar
                          </Button>
                          {p.status === "ACTIVE" ? (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={`/tienda/${p.slug}`} target="_blank" rel="noopener noreferrer">
                                Ver en la tienda
                                <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden />
                              </a>
                            </Button>
                          ) : null}
                          <Button type="button" size="sm" variant="ghost" onClick={() => setDeleteTarget(p)}>
                            Borrar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10 text-center text-[var(--text-muted)]">
                      No hay productos todavía. Crea el primero con «Nuevo producto».
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <Dialog open={open} onOpenChange={(o) => !busy && setOpen(o)}>
          <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{mode === "create" ? "Crear producto" : "Editar producto"}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <Field label="Nombre">
                  <Input value={draft.name} onChange={(e) => onNameChange(e.target.value)} placeholder="Camiseta Sodimusic" />
                </Field>
                <Field label="Slug (URL)" hint="Se sugiere desde el nombre; puedes editarlo.">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 font-mono text-xs text-[var(--text-muted)]">/tienda/</span>
                    <Input value={draft.slug} onChange={(e) => onSlugChange(e.target.value)} placeholder="camiseta-sodimusic" />
                  </div>
                </Field>
                <Field label="Descripción">
                  <Textarea
                    rows={4}
                    value={draft.description}
                    onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Material, corte, detalles del diseño…"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Precio COP">
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={draft.priceCOP}
                      onChange={(e) => setDraft((p) => ({ ...p, priceCOP: Number(e.target.value) || 0 }))}
                    />
                    <p className="text-[11px] text-[var(--text-muted)]">{formatCOP(draft.priceCOP)}</p>
                  </Field>
                  <Field label="Precio anterior (opcional)" hint="Se muestra tachado.">
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      value={draft.compareAtCOP}
                      onChange={(e) => setDraft((p) => ({ ...p, compareAtCOP: e.target.value }))}
                      placeholder="Vacío = sin descuento"
                    />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Categoría">
                    <Input
                      list="admin-product-categories"
                      value={draft.category}
                      onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                      placeholder="Camisetas, Gorras…"
                    />
                    <datalist id="admin-product-categories">
                      {categories.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </Field>
                  <Field label="Tallas (separadas por coma)">
                    <Input
                      value={draft.sizesText}
                      onChange={(e) => setDraft((p) => ({ ...p, sizesText: e.target.value }))}
                      placeholder="S, M, L, XL"
                    />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field label="Stock" hint="Vacío = sin control.">
                    <Input
                      type="number"
                      min={0}
                      value={draft.stock}
                      onChange={(e) => setDraft((p) => ({ ...p, stock: e.target.value }))}
                      placeholder="∞"
                    />
                  </Field>
                  <Field label="Estado">
                    <select
                      className={nativeSelectClass}
                      value={draft.status}
                      onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as ProductStatus }))}
                    >
                      <option value="ACTIVE">Activo (visible)</option>
                      <option value="DRAFT">Borrador (oculto)</option>
                      <option value="SOLD_OUT">Agotado</option>
                    </select>
                  </Field>
                  <Field label="Orden" hint="Menor = primero.">
                    <Input
                      type="number"
                      value={draft.sortOrder}
                      onChange={(e) => setDraft((p) => ({ ...p, sortOrder: Number(e.target.value) || 0 }))}
                    />
                  </Field>
                </div>
                <Field label="Destacado">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={draft.featured} onCheckedChange={(v) => setDraft((p) => ({ ...p, featured: v === true }))} />
                    Mostrar en el bloque de tienda del inicio
                  </label>
                </Field>
              </div>

              <div className="space-y-4">
                <Field
                  label={`Imágenes (${draft.images.length}/${MAX_IMAGES})`}
                  hint="La primera es la portada. Usa ↑ ↓ para reordenar."
                >
                  {draft.images.length === 0 ? (
                    <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border text-xs text-[var(--text-muted)]">
                      Sin imágenes todavía
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {draft.images.map((url, i) => (
                        <li key={`${url}-${i}`} className="flex items-center gap-2 rounded-md border border-border bg-background-card p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={resolveMediaUrl(url)}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-md border border-border object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-mono text-[11px] text-[var(--text-secondary)]" title={url}>
                              {url}
                            </p>
                            {i === 0 ? <p className="text-[10px] uppercase tracking-wider text-primary">Portada</p> : null}
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              aria-label="Subir"
                              disabled={i === 0 || busy}
                              onClick={() => moveImage(i, -1)}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              aria-label="Bajar"
                              disabled={i === draft.images.length - 1 || busy}
                              onClick={() => moveImage(i, 1)}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-400 hover:text-red-300"
                              aria-label="Quitar"
                              disabled={busy}
                              onClick={() => removeImage(i)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Input
                      value={newImageUrl}
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
                    <Button
                      type="button"
                      variant="outline"
                      disabled={busy || !newImageUrl.trim() || draft.images.length >= MAX_IMAGES}
                      onClick={addImageUrl}
                    >
                      Añadir URL
                    </Button>
                  </div>

                  <div className="mt-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void onUploadFiles(e)}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busy || draft.images.length >= MAX_IMAGES}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="mr-2 h-4 w-4" aria-hidden />
                      {uploadProgress ? `Subiendo ${uploadProgress.current}/${uploadProgress.total}…` : "Subir imágenes"}
                    </Button>
                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">JPG, PNG, WebP o GIF · máximo 4,5 MB cada una.</p>
                  </div>
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
            <AlertDialogTitle>¿Borrar este producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{deleteTarget?.name ?? ""}» de la tienda. Esta acción no se puede deshacer. Si solo quieres
              ocultarlo, cámbialo a «Borrador».
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
