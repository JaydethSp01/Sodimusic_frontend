"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Music2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { Beat } from "@/types/models";
import { resolveMediaUrl } from "@/lib/resolve-media-url";
import { toast } from "sonner";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadAdminFile } from "@/app/actions/admin-upload";
import { createBeatAction, deleteBeatAction, patchBeatAction } from "@/app/actions/admin-beats-actions";
import { BeatAudioPlayer } from "@/features/beats/components/beat-audio-player";
import {
  AdminDialogFooter,
  AdminField,
  AdminModuleToolbar,
  AdminNativeSelect,
  AdminResultsBar,
  RowAction,
  adminDialogClass,
} from "@/features/admin/components/admin-primitives";
import { cn } from "@/lib/utils";

type Status = "AVAILABLE" | "SOLD" | "EXCLUSIVE";

const STATUS_TONE: Record<Status, BadgeTone> = { AVAILABLE: "success", SOLD: "neutral", EXCLUSIVE: "gold" };
const STATUS_FILTERS: { value: Status | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "AVAILABLE", label: "Disponibles" },
  { value: "SOLD", label: "Vendidos" },
  { value: "EXCLUSIVE", label: "Exclusivos" },
];

type BeatDraft = {
  title: string;
  genre: string;
  bpm: number | null;
  mood: string | null;
  priceCOP: number;
  priceMp3COP: number | null;
  priceWavCOP: number | null;
  priceStemsCOP: number | null;
  priceExclusiveCOP: number | null;
  status: Status;
  audioUrl: string | null;
  coverUrl: string | null;
  exclusive: boolean;
};

type LicenseKey = "priceMp3COP" | "priceWavCOP" | "priceStemsCOP" | "priceExclusiveCOP";

const LICENSES: { key: LicenseKey; label: string; help: string }[] = [
  { key: "priceMp3COP", label: "Licencia MP3", help: "Uso básico, MP3 320 kbps" },
  { key: "priceWavCOP", label: "Licencia WAV", help: "WAV sin comprimir" },
  { key: "priceStemsCOP", label: "Licencia Stems", help: "Pistas separadas" },
  { key: "priceExclusiveCOP", label: "Licencia exclusiva", help: "Se retira del catálogo" },
];

/** Precio "desde": el menor precio de licencia definido (o el priceCOP escrito si no hay licencias). */
function minLicensePrice(d: Pick<BeatDraft, LicenseKey>): number | null {
  const vals = LICENSES.map((l) => d[l.key]).filter((v): v is number => typeof v === "number" && v > 0);
  return vals.length ? Math.min(...vals) : null;
}

function parsePrice(v: string): number | null {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
}

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
  priceMp3COP: null,
  priceWavCOP: null,
  priceStemsCOP: null,
  priceExclusiveCOP: null,
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");

  const coverPreview = useMemo(() => (draft.coverUrl ? resolveMediaUrl(draft.coverUrl) : null), [draft.coverUrl]);
  const audioPreview = useMemo(() => (draft.audioUrl ? resolveMediaUrl(draft.audioUrl) : null), [draft.audioUrl]);

  /* Filtro solo de presentación (no toca datos ni URL). */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialItems.filter((b) => {
      if (statusFilter !== "ALL" && b.status !== statusFilter) return false;
      if (!q) return true;
      return [b.title, b.genre, b.mood ?? ""].some((s) => s.toLowerCase().includes(q));
    });
  }, [initialItems, query, statusFilter]);

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
      priceMp3COP: row.priceMp3COP ?? null,
      priceWavCOP: row.priceWavCOP ?? null,
      priceStemsCOP: row.priceStemsCOP ?? null,
      priceExclusiveCOP: row.priceExclusiveCOP ?? null,
      status: row.status as Status,
      audioUrl: row.audioUrl,
      coverUrl: row.coverUrl,
      exclusive: row.exclusive,
    });
    setOpen(true);
  }

  async function onSave() {
    if (saving) return;
    const fromLicenses = minLicensePrice(draft);
    const priceCOP = fromLicenses ?? draft.priceCOP;
    if (!draft.title.trim() || !draft.genre.trim() || !Number.isFinite(priceCOP) || priceCOP <= 0) {
      toast.error("Completa título, género y al menos un precio (> 0)");
      return;
    }
    if (draft.audioUrl && !/^(https?:\/\/|\/)/.test(draft.audioUrl)) {
      toast.error("La URL del preview debe empezar por http(s):// o /");
      return;
    }
    setSaving(true);
    try {
      const licensePrices = {
        priceMp3COP: draft.priceMp3COP,
        priceWavCOP: draft.priceWavCOP,
        priceStemsCOP: draft.priceStemsCOP,
        priceExclusiveCOP: draft.priceExclusiveCOP,
      };
      if (mode === "create") {
        const r = await createBeatAction({
          title: draft.title,
          genre: draft.genre,
          bpm: draft.bpm,
          mood: draft.mood,
          priceCOP,
          ...licensePrices,
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
          priceCOP,
          ...licensePrices,
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
      if (file.size > 4.5 * 1024 * 1024) {
        toast.error("El preview debe pesar máximo 4,5 MB (recorta a 30–60 s)");
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      const r = await uploadAdminFile(fd);
      if (!r.ok || !r.url) {
        toast.error(r.error ?? "Error al subir audio");
        return;
      }
      setDraft((p) => ({ ...p, audioUrl: r.url ?? null }));
      toast.success("Preview subido");
    } finally {
      setUploadingAudio(false);
    }
  }

  const licenseSummary = (b: Beat) =>
    [b.priceMp3COP ? "MP3" : null, b.priceWavCOP ? "WAV" : null, b.priceStemsCOP ? "Stems" : null, b.priceExclusiveCOP ? "Excl." : null]
      .filter(Boolean)
      .join(" · ");

  return (
    <div className="space-y-4">
      <AdminModuleToolbar
        search={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" aria-hidden />
            <Input type="search" aria-label="Buscar beats" placeholder="Buscar por título, género o mood…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
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
            <Plus aria-hidden /> Nuevo beat
          </Button>
        }
      />

      {initialItems.length === 0 ? (
        <EmptyState
          icon={Music2}
          title="Aún no hay beats"
          description="Sube el primero con su portada y un preview de 30–60 s: aparecerá en /beats al instante."
          action={
            <Button type="button" onClick={openCreate}>
              <Plus aria-hidden /> Nuevo beat
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
                <AdminTableHeader>Beat</AdminTableHeader>
                <AdminTableHeader>Género</AdminTableHeader>
                <AdminTableHeader align="right">BPM</AdminTableHeader>
                <AdminTableHeader align="right">Precio desde</AdminTableHeader>
                <AdminTableHeader>Estado</AdminTableHeader>
                <AdminTableHeader align="right">
                  <span className="sr-only">Acciones</span>
                </AdminTableHeader>
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {visible.map((b) => (
                <AdminTableRow key={b.id} className={cn(b.status === "SOLD" && "opacity-70")}>
                  <AdminTableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={b.title} src={b.coverUrl ? resolveMediaUrl(b.coverUrl) : null} size={40} square />
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{b.title}</p>
                        {b.mood ? <p className="truncate text-body-sm text-text-3">{b.mood}</p> : null}
                      </div>
                    </div>
                  </AdminTableCell>
                  <AdminTableCell>
                    <Badge tone="fire" variant="outline">
                      {b.genre}
                    </Badge>
                  </AdminTableCell>
                  <AdminTableCell mono align="right">
                    {b.bpm ?? "—"}
                  </AdminTableCell>
                  <AdminTableCell mono align="right" className="whitespace-nowrap">
                    <span className="text-text-1">{b.priceCOP.toLocaleString("es-CO")} COP</span>
                    {licenseSummary(b) ? <span className="block text-label-sm text-text-3">{licenseSummary(b)}</span> : null}
                  </AdminTableCell>
                  <AdminTableCell>
                    <Badge tone={STATUS_TONE[b.status as Status] ?? "neutral"}>{b.status}</Badge>
                  </AdminTableCell>
                  <AdminTableActions>
                    <RowAction label="Editar" onClick={() => openEdit(b)}>
                      <Pencil />
                    </RowAction>
                    <RowAction label="Borrar" className="hover:text-danger" onClick={() => setDeleteTarget(b)}>
                      <Trash2 />
                    </RowAction>
                  </AdminTableActions>
                </AdminTableRow>
              ))}
            </AdminTableBody>
          </AdminTable>
        </div>
      )}
      <AdminResultsBar summary={initialItems.length ? `${initialItems.length} ${initialItems.length === 1 ? "beat" : "beats"} en el catálogo` : undefined} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={cn(adminDialogClass, "max-w-3xl")}>
          <DialogHeader>
            <DialogTitle className="text-title">{mode === "create" ? "Crear beat" : "Editar beat"}</DialogTitle>
            <DialogDescription>Título, género y al menos un precio son obligatorios. El resto se puede completar después.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <AdminField label="Título">
                <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
              </AdminField>
              <AdminField label="Género">
                <Input value={draft.genre} onChange={(e) => setDraft((p) => ({ ...p, genre: e.target.value }))} />
              </AdminField>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="BPM (opcional)">
                  <Input type="number" value={draft.bpm ?? ""} onChange={(e) => setDraft((p) => ({ ...p, bpm: e.target.value === "" ? null : Number(e.target.value) }))} />
                </AdminField>
                <AdminField label="Precio «desde» COP" hint={minLicensePrice(draft) !== null ? "Se calcula con la licencia más barata." : "Sin licencias: precio único."}>
                  <Input
                    type="number"
                    min={0}
                    value={minLicensePrice(draft) ?? draft.priceCOP}
                    readOnly={minLicensePrice(draft) !== null}
                    onChange={(e) => setDraft((p) => ({ ...p, priceCOP: Number(e.target.value) || 0 }))}
                    className={cn(minLicensePrice(draft) !== null && "bg-ink-2 text-text-2")}
                  />
                </AdminField>
              </div>

              <fieldset className="space-y-3 rounded-lg border border-line-1 bg-ink-1/60 p-4">
                <legend className="px-1 text-label text-text-3">Precios por licencia (COP)</legend>
                <p className="text-body-sm text-text-3">Deja vacío para no ofrecer esa licencia.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {LICENSES.map((l) => (
                    <div key={l.key} className="flex flex-col gap-2">
                      <Label htmlFor={`beat-${l.key}`}>{l.label}</Label>
                      <Input
                        id={`beat-${l.key}`}
                        type="number"
                        min={0}
                        step={1000}
                        inputMode="numeric"
                        placeholder="—"
                        value={draft[l.key] ?? ""}
                        onChange={(e) => setDraft((p) => ({ ...p, [l.key]: parsePrice(e.target.value) }))}
                        aria-describedby={`beat-${l.key}-help`}
                      />
                      <p id={`beat-${l.key}-help`} className="text-body-sm text-text-3">
                        {l.help}
                      </p>
                    </div>
                  ))}
                </div>
              </fieldset>
              <AdminField label="Mood (opcional)">
                <Input value={draft.mood ?? ""} onChange={(e) => setDraft((p) => ({ ...p, mood: e.target.value.trim().length ? e.target.value : null }))} />
              </AdminField>

              <AdminField label="Estado">
                <AdminNativeSelect value={draft.status} onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as Status }))}>
                  <option value="AVAILABLE">Disponible (AVAILABLE)</option>
                  <option value="SOLD">Vendido (SOLD)</option>
                  <option value="EXCLUSIVE">Exclusivo (EXCLUSIVE)</option>
                </AdminNativeSelect>
              </AdminField>

              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-body-sm text-text-1">
                <Checkbox checked={draft.exclusive} onCheckedChange={(v) => setDraft((p) => ({ ...p, exclusive: v === true }))} />
                Beat exclusivo (se retira del catálogo al venderse)
              </label>
            </div>

            <div className="space-y-4">
              <AdminField label="Cover (image)" hint="JPG, PNG o WebP. Cuadrada, mínimo 600 px.">
                {coverPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverPreview} alt="Previsualización de la portada" className="h-32 w-full rounded border border-line-1 object-cover" />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded border border-dashed border-line-2 bg-ink-1 text-text-3">
                    <Music2 className="h-6 w-6" strokeWidth={1.5} aria-hidden />
                  </div>
                )}
                <Input placeholder="/uploads/… o https://" value={draft.coverUrl ?? ""} onChange={(e) => setDraft((p) => ({ ...p, coverUrl: normalizeMaybeUrl(e.target.value) }))} />
                <input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Subir portada" className="block w-full cursor-pointer text-body-sm text-text-2 file:mr-3 file:cursor-pointer file:rounded file:border file:border-line-2 file:bg-ink-3 file:px-3 file:py-2 file:text-body-sm file:font-medium file:text-text-1" onChange={onUploadCover} />
                {uploadingCover ? (
                  <p className="text-body-sm text-fire-400" role="status">
                    Subiendo…
                  </p>
                ) : null}
              </AdminField>

              <AdminField label="Preview MP3 (audioUrl)" hint="MP3 de 30–60 s, máximo 4,5 MB. Es lo que suena en /beats.">
                {audioPreview ? (
                  <div className="rounded border border-line-1 bg-ink-1 p-3">
                    <BeatAudioPlayer src={audioPreview} title={draft.title || "Beat"} />
                  </div>
                ) : (
                  <div className="flex h-20 w-full items-center justify-center rounded border border-dashed border-line-2 bg-ink-1 text-body-sm text-text-3">Sin preview</div>
                )}
                <Input placeholder="/uploads/... o https://" value={draft.audioUrl ?? ""} onChange={(e) => setDraft((p) => ({ ...p, audioUrl: normalizeMaybeUrl(e.target.value) }))} />
                <input
                  type="file"
                  accept="audio/mpeg,.mp3"
                  aria-label="Subir preview MP3"
                  className="block w-full cursor-pointer text-body-sm text-text-2 file:mr-3 file:cursor-pointer file:rounded file:border file:border-line-2 file:bg-ink-3 file:px-3 file:py-2 file:text-body-sm file:font-medium file:text-text-1"
                  onChange={onUploadAudio}
                />
                {uploadingAudio ? (
                  <p className="text-body-sm text-fire-400" role="status">
                    Subiendo…
                  </p>
                ) : null}
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
            <AlertDialogTitle className="text-title">¿Borrar este beat?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminará «{deleteTarget?.title ?? ""}». Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteBusy}>Cancelar</AlertDialogCancel>
            <Button type="button" variant="danger" loading={deleteBusy} onClick={() => void confirmDeleteBeat()}>
              Borrar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
