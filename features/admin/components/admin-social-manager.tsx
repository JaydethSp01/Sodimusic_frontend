"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ExternalLink,
  Eye,
  EyeOff,
  Facebook,
  Link2,
  Pin,
  PinOff,
  RefreshCw,
  Search,
  Trash2,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { SocialPost, SocialPostKind, SocialSource, SocialSourceKind, SocialStatus } from "@/types/models";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createSocialPostAction,
  createSocialSourceAction,
  deleteSocialPostAction,
  deleteSocialSourceAction,
  patchSocialPostAction,
  patchSocialSourceAction,
  syncSocialAction,
} from "@/app/actions/admin-social-actions";

export const ADMIN_SOCIAL_PAGE_SIZE = 20;

type StatusFilter = "ALL" | "VISIBLE" | "HIDDEN";

const nativeSelectClass =
  "flex h-10 w-full rounded-md border border-border bg-background-secondary px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const POST_KIND_META: Record<SocialPostKind, { label: string; Icon: LucideIcon; className: string }> = {
  YOUTUBE_VIDEO: { label: "YouTube", Icon: Youtube, className: "border-transparent bg-[#d90000] text-white" },
  FACEBOOK_POST: { label: "Facebook", Icon: Facebook, className: "border-transparent bg-[#1877f2] text-white" },
  LINK: { label: "Enlace", Icon: Link2, className: "border-transparent bg-background-elevated text-[var(--text-secondary)]" },
};

const SOURCE_KIND_META: Record<SocialSourceKind, { label: string; Icon: LucideIcon; placeholder: string; hint: string }> = {
  YOUTUBE_CHANNEL: {
    label: "Canal de YouTube",
    Icon: Youtube,
    placeholder: "https://www.youtube.com/@sodimusic o UC…",
    hint: "URL del canal (/@handle, /channel/UC…, /c/…) o el channelId. Se resuelve el UC… automáticamente.",
  },
  FACEBOOK_PAGE: {
    label: "Página de Facebook",
    Icon: Facebook,
    placeholder: "sodimusic.oficial",
    hint: "Id o nombre de usuario de una página que administres (necesita FACEBOOK_PAGE_TOKEN). Los perfiles personales no se pueden leer.",
  },
  YOUTUBE_SEARCH: {
    label: "Búsqueda en YouTube",
    Icon: Search,
    placeholder: "Sodimusic",
    hint: "Texto a buscar (menciones en canales ajenos). Solo funciona con YOUTUBE_API_KEY.",
  },
};

const ENV_HELP: Array<{ key: keyof SocialStatus["env"]; name: string; required: string; how: string }> = [
  {
    key: "youtubeApiKey",
    name: "YOUTUBE_API_KEY",
    required: "Fechas exactas de YouTube y «Búsqueda en YouTube» (menciones). Sin clave, los canales se leen igual pero con fechas aproximadas.",
    how: "Google Cloud Console → crea un proyecto → habilita «YouTube Data API v3» → Credenciales → «Clave de API». Es gratuita.",
  },
  {
    key: "facebookPageToken",
    name: "FACEBOOK_PAGE_TOKEN",
    required: "Publicaciones de la página de Facebook. Sin token, esa fuente no se sincroniza.",
    how: "developers.facebook.com → tu app → Herramientas → Graph API Explorer → token de página con el permiso pages_read_engagement → conviértelo a larga duración (Depurador de tokens → «Extender»).",
  },
  {
    key: "cronSecret",
    name: "CRON_SECRET",
    required: "Sincronización automática diaria (cron de Vercel). Sin ella solo se sincroniza al abrir la web o con «Sincronizar ahora».",
    how: "Cualquier cadena larga y aleatoria (p. ej. 32+ caracteres). Ponla en las variables de entorno del backend.",
  },
];

const dateTimeFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });
const dateFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateTimeFmt.format(d);
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

function buildAdminHref(params: { q?: string; status?: string; page?: number }): string {
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set("q", params.q.trim());
  if (params.status && params.status !== "ALL") qs.set("status", params.status);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  const s = qs.toString();
  return s ? `/admin/dashboard/novedades?${s}` : "/admin/dashboard/novedades";
}

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

type SourceDraft = { kind: SocialSourceKind; value: string; label: string };
const emptySourceDraft = (): SourceDraft => ({ kind: "YOUTUBE_CHANNEL", value: "", label: "" });

type PostDraft = { url: string; title: string; text: string; imageUrl: string; publishedAt: string };
const emptyPostDraft = (): PostDraft => ({ url: "", title: "", text: "", imageUrl: "", publishedAt: "" });

interface AdminSocialManagerProps {
  status: SocialStatus | null;
  sources: SocialSource[];
  posts: SocialPost[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
  statusFilter: StatusFilter;
  /** El backend no respondió al listado de publicaciones (ruta inexistente o caído). */
  apiUnavailable?: boolean;
}

export function AdminSocialManager({
  status,
  sources,
  posts,
  total,
  page,
  pageSize,
  query,
  statusFilter,
  apiUnavailable = false,
}: AdminSocialManagerProps) {
  const router = useRouter();
  const [navPending, startNav] = useTransition();
  const [refreshing, startRefresh] = useTransition();
  const [syncPending, setSyncPending] = useState(false);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState(query);

  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceDraft, setSourceDraft] = useState<SourceDraft>(() => emptySourceDraft());
  const [sourceSaving, setSourceSaving] = useState(false);
  const [sourceDeleteTarget, setSourceDeleteTarget] = useState<SocialSource | null>(null);

  const [postOpen, setPostOpen] = useState(false);
  const [postDraft, setPostDraft] = useState<PostDraft>(() => emptyPostDraft());
  const [postSaving, setPostSaving] = useState(false);
  const [postDeleteTarget, setPostDeleteTarget] = useState<SocialPost | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const missingEnv = ENV_HELP.filter((e) => status && !status.env[e.key]);

  function navigate(next: { q?: string; status?: string; page?: number }) {
    startNav(() => {
      router.push(buildAdminHref({ q: query, status: statusFilter, page: 1, ...next }));
    });
  }

  function onSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    navigate({ q: searchValue, page: 1 });
  }

  /** Vuelve a pedir los datos del servidor sin bloquear la UI (transición). */
  function refresh() {
    startRefresh(() => router.refresh());
  }

  /* --------------------------------- sync --------------------------------- */

  async function onSync() {
    if (syncPending) return;
    setSyncPending(true);
    try {
      const r = await syncSocialAction();
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      const s = r.row;
      const failed = s?.sources.filter((x) => x.error) ?? [];
      toast.success(`Sincronización completada: ${s?.added ?? 0} añadidas · ${s?.updated ?? 0} actualizadas`, {
        description: `${(s?.sources.length ?? 0) - failed.length} de ${s?.sources.length ?? 0} fuentes sin errores`,
      });
      if (failed.length) {
        toast.error(`${failed.length} ${failed.length === 1 ? "fuente con error" : "fuentes con error"}`, {
          description: failed.map((x) => `${x.label}: ${x.error}`).join(" · "),
          duration: 10_000,
        });
      }
      refresh();
    } finally {
      setSyncPending(false);
    }
  }

  /* -------------------------------- sources ------------------------------- */

  function openSourceDialog() {
    setSourceDraft(emptySourceDraft());
    setSourceOpen(true);
  }

  async function onSaveSource() {
    if (sourceSaving) return;
    const value = sourceDraft.value.trim();
    if (!value) {
      toast.error("Indica la URL o el identificador de la fuente");
      return;
    }
    const isUrl = isHttpUrl(value);
    setSourceSaving(true);
    try {
      const r = await createSocialSourceAction({
        kind: sourceDraft.kind,
        label: sourceDraft.label.trim() || undefined,
        ...(isUrl ? { url: value } : { externalId: value }),
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(`Fuente añadida: ${r.row?.label ?? value}`);
      setSourceOpen(false);
      refresh();
    } finally {
      setSourceSaving(false);
    }
  }

  async function toggleSource(src: SocialSource) {
    if (rowBusy) return;
    setRowBusy(src.id);
    try {
      const r = await patchSocialSourceAction(src.id, { enabled: !src.enabled });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(!src.enabled ? "Fuente activada" : "Fuente desactivada");
      refresh();
    } finally {
      setRowBusy(null);
    }
  }

  async function confirmDeleteSource() {
    const target = sourceDeleteTarget;
    if (!target || deleting) return;
    setDeleting(true);
    try {
      const r = await deleteSocialSourceAction(target.id);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Fuente borrada");
      setSourceDeleteTarget(null);
      refresh();
    } finally {
      setDeleting(false);
    }
  }

  /* --------------------------------- posts -------------------------------- */

  function openPostDialog() {
    setPostDraft(emptyPostDraft());
    setPostOpen(true);
  }

  async function onSavePost() {
    if (postSaving) return;
    const url = postDraft.url.trim();
    if (!url || !isHttpUrl(url)) {
      toast.error("Indica una URL válida (https://…)");
      return;
    }
    if (postDraft.imageUrl.trim() && !isHttpUrl(postDraft.imageUrl)) {
      toast.error("La imagen debe ser una URL válida (https://…)");
      return;
    }
    let publishedAt: string | undefined;
    if (postDraft.publishedAt.trim()) {
      const d = new Date(postDraft.publishedAt);
      if (Number.isNaN(d.getTime())) {
        toast.error("La fecha no es válida");
        return;
      }
      publishedAt = d.toISOString();
    }
    setPostSaving(true);
    try {
      const r = await createSocialPostAction({
        url,
        title: postDraft.title.trim() || undefined,
        text: postDraft.text.trim() || undefined,
        imageUrl: postDraft.imageUrl.trim() || undefined,
        publishedAt,
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Publicación añadida", { description: r.row?.title });
      setPostOpen(false);
      refresh();
    } finally {
      setPostSaving(false);
    }
  }

  async function patchPost(post: SocialPost, input: Parameters<typeof patchSocialPostAction>[1], okMessage: string) {
    if (rowBusy) return;
    setRowBusy(post.id);
    try {
      const r = await patchSocialPostAction(post.id, input);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success(okMessage);
      refresh();
    } finally {
      setRowBusy(null);
    }
  }

  async function confirmDeletePost() {
    const target = postDeleteTarget;
    if (!target || deleting) return;
    setDeleting(true);
    try {
      const r = await deleteSocialPostAction(target.id);
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      toast.success("Publicación borrada");
      setPostDeleteTarget(null);
      refresh();
    } finally {
      setDeleting(false);
    }
  }

  const anyBusy = rowBusy !== null || deleting || refreshing;

  return (
    <div className="space-y-6">
      {/* ------------------------------ Estado ------------------------------ */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="font-display text-xl">Estado del feed</CardTitle>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Lo último de YouTube y Facebook se recoge solo y se muestra en el inicio y en «/novedades». Aquí puedes forzar
              la sincronización, gestionar las fuentes y ocultar, fijar o añadir publicaciones a mano.
            </p>
          </div>
          <Button type="button" onClick={() => void onSync()} disabled={syncPending} aria-busy={syncPending}>
            <RefreshCw className={cn("h-4 w-4", syncPending && "animate-spin")} aria-hidden />
            {syncPending ? "Sincronizando…" : "Sincronizar ahora"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiUnavailable ? (
            <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              El backend no respondió a «/api/admin/social». Comprueba que esté desplegada la versión con el módulo de
              novedades.
            </p>
          ) : null}
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCell label="Última sincronización" value={fmtDateTime(status?.lastSyncAt)} />
            <StatCell label="Fuentes" value={String(status?.counts.sources ?? sources.length)} />
            <StatCell label="Publicaciones" value={String(status?.counts.posts ?? total)} />
            <StatCell label="Ocultas" value={String(status?.counts.hidden ?? 0)} />
          </dl>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">Variables de entorno</h3>
            <ul className="mt-2 grid gap-2 md:grid-cols-3">
              {ENV_HELP.map((e) => {
                const ok = status ? status.env[e.key] : false;
                return (
                  <li
                    key={e.key}
                    className={cn(
                      "rounded-md border px-3 py-2 text-sm",
                      ok ? "border-primary/30 bg-primary/5" : "border-[var(--gold)]/30 bg-[var(--gold)]/5",
                    )}
                  >
                    <p className="flex items-center gap-2 font-mono text-xs">
                      {ok ? (
                        <CircleCheck className="h-4 w-4 text-primary" aria-hidden />
                      ) : (
                        <CircleAlert className="h-4 w-4 text-[var(--gold)]" aria-hidden />
                      )}
                      <span className="text-foreground">{e.name}</span>
                      <span className="text-[var(--text-muted)]">{ok ? "configurada" : "falta"}</span>
                    </p>
                    {!ok ? (
                      <>
                        <p className="mt-1.5 text-xs text-[var(--text-secondary)]">{e.required}</p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          <span className="text-foreground">Cómo conseguirla:</span> {e.how}
                        </p>
                      </>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {status && missingEnv.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--text-muted)]">Todo configurado.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------ Fuentes ----------------------------- */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="font-display text-xl">Fuentes</CardTitle>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Canales de YouTube, páginas de Facebook y búsquedas que se revisan en cada sincronización. Los canales activos
              de «Canales» se añaden solos.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={openSourceDialog}>
            Añadir fuente
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Activa</TableHead>
                  <TableHead>Última lectura</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((src) => {
                  const meta = SOURCE_KIND_META[src.kind] ?? SOURCE_KIND_META.YOUTUBE_CHANNEL;
                  const isBusy = rowBusy === src.id;
                  return (
                    <TableRow key={src.id} className={cn(isBusy && "opacity-60")}>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <meta.Icon className="h-4 w-4 text-[var(--text-muted)]" aria-hidden />
                          {meta.label}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex max-w-[320px] flex-col">
                          <span className="truncate">{src.label}</span>
                          <span className="truncate font-mono text-[11px] text-[var(--text-muted)]" title={src.url ?? src.externalId}>
                            {src.externalId}
                          </span>
                          {src.lastError ? (
                            <span className="mt-1 truncate text-[11px] text-red-400" title={src.lastError}>
                              {src.lastError}
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <label className="flex items-center gap-2 text-xs">
                          <Checkbox
                            checked={src.enabled}
                            disabled={isBusy || anyBusy}
                            aria-label={src.enabled ? `Desactivar ${src.label}` : `Activar ${src.label}`}
                            onCheckedChange={() => void toggleSource(src)}
                          />
                          <span className="text-[var(--text-muted)]">{src.enabled ? "Sí" : "No"}</span>
                        </label>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-[var(--text-secondary)]">{fmtDateTime(src.lastFetchedAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {src.url ? (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={src.url} target="_blank" rel="noopener noreferrer">
                                Abrir
                                <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden />
                              </a>
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={anyBusy}
                            aria-label={`Borrar fuente ${src.label}`}
                            onClick={() => setSourceDeleteTarget(src)}
                          >
                            Borrar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {sources.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-[var(--text-muted)]">
                      No hay fuentes todavía. Se crean solas al sincronizar o añade una con «Añadir fuente».
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <Dialog open={sourceOpen} onOpenChange={(o) => !sourceSaving && setSourceOpen(o)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Añadir fuente</DialogTitle>
              <DialogDescription>Se revisará en cada sincronización.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Field label="Tipo">
                <select
                  className={nativeSelectClass}
                  value={sourceDraft.kind}
                  onChange={(e) => setSourceDraft((p) => ({ ...p, kind: e.target.value as SocialSourceKind }))}
                >
                  {(Object.keys(SOURCE_KIND_META) as SocialSourceKind[]).map((k) => (
                    <option key={k} value={k}>
                      {SOURCE_KIND_META[k].label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="URL o identificador" hint={SOURCE_KIND_META[sourceDraft.kind].hint}>
                <Input
                  value={sourceDraft.value}
                  onChange={(e) => setSourceDraft((p) => ({ ...p, value: e.target.value }))}
                  placeholder={SOURCE_KIND_META[sourceDraft.kind].placeholder}
                />
              </Field>
              <Field label="Etiqueta (opcional)" hint="Nombre que verás en esta lista. Si se deja vacío se usa el del canal o página.">
                <Input
                  value={sourceDraft.label}
                  onChange={(e) => setSourceDraft((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Facebook Sodimusic"
                  maxLength={80}
                />
              </Field>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={sourceSaving} onClick={() => setSourceOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" disabled={sourceSaving} onClick={() => void onSaveSource()}>
                  {sourceSaving ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      {/* --------------------------- Publicaciones -------------------------- */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="font-display text-xl">Publicaciones</CardTitle>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Lo que se muestra en el feed público. Las ocultas no aparecen; las fijadas van siempre primero. Al
              sincronizar nunca se cambian estado ni fijado.
            </p>
          </div>
          <Button type="button" onClick={openPostDialog}>
            Añadir enlace
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
                  placeholder="Buscar por título, autor, texto…"
                  aria-label="Buscar publicaciones"
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline" disabled={navPending}>
                Buscar
              </Button>
            </form>
            <div className="flex items-center gap-2">
              <Label htmlFor="admin-social-status" className="text-xs text-[var(--text-secondary)]">
                Estado
              </Label>
              <select
                id="admin-social-status"
                className={cn(nativeSelectClass, "w-auto min-w-36")}
                value={statusFilter}
                disabled={navPending}
                onChange={(e) => navigate({ status: e.target.value, page: 1 })}
              >
                <option value="ALL">Todas</option>
                <option value="VISIBLE">Visibles</option>
                <option value="HIDDEN">Ocultas</option>
              </select>
            </div>
          </div>

          <div className={cn("overflow-x-auto transition-opacity", (navPending || refreshing) && "opacity-60")} aria-busy={navPending || refreshing}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Miniatura</TableHead>
                  <TableHead>Publicación</TableHead>
                  <TableHead>Red</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => {
                  const meta = POST_KIND_META[post.kind] ?? POST_KIND_META.LINK;
                  const isBusy = rowBusy === post.id;
                  const hidden = post.status === "HIDDEN";
                  return (
                    <TableRow key={post.id} className={cn(isBusy && "opacity-60")} data-post-id={post.id}>
                      <TableCell>
                        {post.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={post.imageUrl} alt="" className="aspect-video w-20 rounded border border-border object-cover" loading="lazy" />
                        ) : (
                          <div className="flex aspect-video w-20 items-center justify-center rounded border border-dashed border-border text-[var(--text-muted)]">
                            <meta.Icon className="h-4 w-4" aria-hidden />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex max-w-[360px] flex-col">
                          <span className="line-clamp-2">
                            {post.pinned ? (
                              <Pin className="mr-1 inline h-3.5 w-3.5 text-[var(--gold)]" aria-label="Fijada" />
                            ) : null}
                            {post.title}
                          </span>
                          {post.author ? <span className="text-xs text-[var(--text-secondary)]">{post.author}</span> : null}
                          <span className="truncate font-mono text-[11px] text-[var(--text-muted)]" title={post.url}>
                            {post.url}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1", meta.className)}>
                          <meta.Icon className="h-3 w-3" aria-hidden />
                          {meta.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-[var(--text-secondary)]">{fmtDate(post.publishedAt)}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            hidden
                              ? "border-transparent bg-background-elevated text-[var(--text-secondary)]"
                              : "border-transparent bg-primary-muted text-primary"
                          }
                        >
                          {hidden ? "Oculta" : "Visible"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={anyBusy}
                            aria-label={`${hidden ? "Mostrar" : "Ocultar"}: ${post.title}`}
                            onClick={() =>
                              void patchPost(
                                post,
                                { status: hidden ? "VISIBLE" : "HIDDEN" },
                                hidden ? "Publicación visible" : "Publicación oculta",
                              )
                            }
                          >
                            {hidden ? <Eye className="h-3.5 w-3.5" aria-hidden /> : <EyeOff className="h-3.5 w-3.5" aria-hidden />}
                            {hidden ? "Mostrar" : "Ocultar"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={anyBusy}
                            aria-label={`${post.pinned ? "Desfijar" : "Fijar"}: ${post.title}`}
                            onClick={() =>
                              void patchPost(post, { pinned: !post.pinned }, post.pinned ? "Publicación desfijada" : "Publicación fijada")
                            }
                          >
                            {post.pinned ? <PinOff className="h-3.5 w-3.5" aria-hidden /> : <Pin className="h-3.5 w-3.5" aria-hidden />}
                            {post.pinned ? "Desfijar" : "Fijar"}
                          </Button>
                          <Button size="sm" variant="ghost" asChild>
                            <a href={post.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir: ${post.title}`}>
                              Abrir
                              <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden />
                            </a>
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            disabled={anyBusy}
                            aria-label={`Borrar: ${post.title}`}
                            onClick={() => setPostDeleteTarget(post)}
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                            Borrar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-[var(--text-muted)]">
                      {query || statusFilter !== "ALL"
                        ? "No hay publicaciones que coincidan con el filtro."
                        : "No hay publicaciones todavía. Pulsa «Sincronizar ahora» o añade un enlace."}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
              {total} {total === 1 ? "publicación" : "publicaciones"} · Página {Math.min(page, totalPages)} de {totalPages}
            </p>
            {totalPages > 1 ? (
              <nav aria-label="Paginación" className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild={page > 1} disabled={page <= 1}>
                  {page > 1 ? (
                    <Link href={buildAdminHref({ q: query, status: statusFilter, page: page - 1 })} rel="prev">
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
                    <Link href={buildAdminHref({ q: query, status: statusFilter, page: page + 1 })} rel="next">
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

        <Dialog open={postOpen} onOpenChange={(o) => !postSaving && setPostOpen(o)}>
          <DialogContent className="max-h-[92vh] max-w-xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Añadir enlace</DialogTitle>
              <DialogDescription>
                Pega la URL de un video de YouTube, una publicación de Facebook o cualquier página. El título y la imagen se
                completan solos si la página los expone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Field label="URL">
                <Input
                  type="url"
                  inputMode="url"
                  value={postDraft.url}
                  onChange={(e) => setPostDraft((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=…"
                  autoFocus
                />
              </Field>
              <Field label="Título (opcional)" hint="Obligatorio solo si la página no ofrece metadatos (p. ej. Facebook sin token).">
                <Input value={postDraft.title} onChange={(e) => setPostDraft((p) => ({ ...p, title: e.target.value }))} maxLength={200} />
              </Field>
              <Field label="Texto (opcional)">
                <Textarea rows={3} value={postDraft.text} onChange={(e) => setPostDraft((p) => ({ ...p, text: e.target.value }))} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Imagen (opcional)" hint="URL de la miniatura.">
                  <Input
                    type="url"
                    inputMode="url"
                    value={postDraft.imageUrl}
                    onChange={(e) => setPostDraft((p) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://…/imagen.jpg"
                  />
                </Field>
                <Field label="Fecha (opcional)" hint="Si se deja vacía se usa la de la página o la de hoy.">
                  <Input
                    type="datetime-local"
                    value={postDraft.publishedAt}
                    onChange={(e) => setPostDraft((p) => ({ ...p, publishedAt: e.target.value }))}
                  />
                </Field>
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <Button type="button" variant="outline" disabled={postSaving} onClick={() => setPostOpen(false)}>
                  Cancelar
                </Button>
                <Button type="button" disabled={postSaving} onClick={() => void onSavePost()}>
                  {postSaving ? "Guardando…" : "Guardar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>

      <AlertDialog open={sourceDeleteTarget !== null} onOpenChange={(o) => !o && !deleting && setSourceDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-background-card">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar esta fuente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se dejará de revisar «{sourceDeleteTarget?.label ?? ""}». Sus publicaciones ya importadas se conservan. Si
              solo quieres pausarla, desactívala.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={deleting} onClick={() => void confirmDeleteSource()}>
              {deleting ? "Borrando…" : "Borrar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={postDeleteTarget !== null} onOpenChange={(o) => !o && !deleting && setPostDeleteTarget(null)}>
        <AlertDialogContent className="border-white/10 bg-background-card">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar esta publicación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{postDeleteTarget?.title ?? ""}» del feed. Si viene de una fuente activa, la próxima
              sincronización puede volver a importarla; si solo quieres que no se vea, usa «Ocultar».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={deleting} onClick={() => void confirmDeletePost()}>
              {deleting ? "Borrando…" : "Borrar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background-secondary/40 px-3 py-2">
      <dt className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
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
