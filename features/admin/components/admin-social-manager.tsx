"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  CircleAlert,
  CircleCheck,
  ExternalLink,
  Eye,
  EyeOff,
  Facebook,
  Link2,
  Newspaper,
  Pin,
  PinOff,
  Plus,
  RefreshCw,
  Rss,
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
import { AdminTable, AdminTableActions, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "@/components/ds/admin-table";
import { EmptyState } from "@/components/ds/empty-state";
import { Pagination } from "@/components/ds/pagination";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AdminDialogFooter,
  AdminErrorNotice,
  AdminField,
  AdminModuleToolbar,
  AdminNativeSelect,
  AdminResultsBar,
  AdminSection,
  AdminSectionHeading,
  RowAction,
  adminDialogClass,
} from "@/features/admin/components/admin-primitives";
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

const POST_KIND_META: Record<SocialPostKind, { label: string; Icon: LucideIcon; tone: BadgeTone }> = {
  YOUTUBE_VIDEO: { label: "YouTube", Icon: Youtube, tone: "danger" },
  FACEBOOK_POST: { label: "Facebook", Icon: Facebook, tone: "sea" },
  LINK: { label: "Enlace", Icon: Link2, tone: "neutral" },
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
    <div className="space-y-10">
      {/* ------------------------------ Estado ------------------------------ */}
      <AdminSection
        id="social-status"
        title="Estado del feed"
        description="Lo último de YouTube y Facebook se recoge solo y se muestra en el inicio y en «/novedades». Aquí puedes forzar la sincronización, gestionar las fuentes y ocultar, fijar o añadir publicaciones a mano."
        action={
          <Button type="button" size="sm" loading={syncPending} onClick={() => void onSync()}>
            {syncPending ? null : <RefreshCw aria-hidden />}
            {syncPending ? "Sincronizando…" : "Sincronizar ahora"}
          </Button>
        }
        contentClassName="space-y-5 p-5"
      >
        {apiUnavailable ? (
          <AdminErrorNotice>El backend no respondió a «/api/admin/social». Comprueba que esté desplegada la versión con el módulo de novedades.</AdminErrorNotice>
        ) : null}
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCell label="Última sincronización" value={fmtDateTime(status?.lastSyncAt)} small />
          <StatCell label="Fuentes" value={String(status?.counts.sources ?? sources.length)} />
          <StatCell label="Publicaciones" value={String(status?.counts.posts ?? total)} />
          <StatCell label="Ocultas" value={String(status?.counts.hidden ?? 0)} />
        </dl>

        <div>
          <h3 className="text-label text-text-3">Variables de entorno</h3>
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {ENV_HELP.map((e) => {
              const ok = status ? status.env[e.key] : false;
              return (
                <li key={e.key} className={cn("rounded border p-3", ok ? "border-line-1 bg-ink-1" : "border-warning/40 bg-warning/[0.06]")}>
                  <div className="flex items-center gap-2">
                    {ok ? (
                      <CircleCheck className="h-5 w-5 shrink-0 text-success" strokeWidth={1.75} aria-hidden />
                    ) : (
                      <CircleAlert className="h-5 w-5 shrink-0 text-warning" strokeWidth={1.75} aria-hidden />
                    )}
                    <span className="min-w-0 truncate font-mono text-body-sm text-text-1">{e.name}</span>
                    <Badge tone={ok ? "success" : "warning"} className="ml-auto">
                      {ok ? "Configurada" : "Falta"}
                    </Badge>
                  </div>
                  {!ok ? (
                    <>
                      <p className="mt-2 text-body-sm text-text-2">{e.required}</p>
                      <p className="mt-1.5 text-body-sm text-text-3">
                        <span className="text-text-1">Cómo conseguirla:</span> {e.how}
                      </p>
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {status && missingEnv.length === 0 ? <p className="mt-2 text-body-sm text-text-3">Todo configurado.</p> : null}
        </div>
      </AdminSection>

      {/* ------------------------------ Fuentes ----------------------------- */}
      <section aria-labelledby="social-sources-title" className="space-y-4">
        <AdminSectionHeading
          id="social-sources-title"
          title="Fuentes"
          description="Canales de YouTube, páginas de Facebook y búsquedas que se revisan en cada sincronización. Los canales activos de «Canales» se añaden solos."
          action={
            <Button type="button" variant="outline" size="sm" onClick={openSourceDialog}>
              <Plus aria-hidden /> Añadir fuente
            </Button>
          }
        />
        {sources.length === 0 ? (
          <EmptyState icon={Rss} title="No hay fuentes todavía" description="Se crean solas al sincronizar o añade una con «Añadir fuente»." />
        ) : (
          <div className="scroll-fade-x overflow-x-auto md:[mask-image:none]">
            <AdminTable>
              <AdminTableHead>
                <AdminTableRow>
                  <AdminTableHeader>Tipo</AdminTableHeader>
                  <AdminTableHeader>Fuente</AdminTableHeader>
                  <AdminTableHeader>Activa</AdminTableHeader>
                  <AdminTableHeader>Última lectura</AdminTableHeader>
                  <AdminTableHeader align="right">
                    <span className="sr-only">Acciones</span>
                  </AdminTableHeader>
                </AdminTableRow>
              </AdminTableHead>
              <AdminTableBody>
                {sources.map((src) => {
                  const meta = SOURCE_KIND_META[src.kind] ?? SOURCE_KIND_META.YOUTUBE_CHANNEL;
                  const isBusy = rowBusy === src.id;
                  return (
                    <AdminTableRow key={src.id} className={cn(isBusy && "opacity-60")}>
                      <AdminTableCell>
                        <span className="inline-flex items-center gap-2 whitespace-nowrap text-body-sm text-text-2">
                          <meta.Icon className="h-5 w-5 text-text-3" strokeWidth={1.75} aria-hidden />
                          {meta.label}
                        </span>
                      </AdminTableCell>
                      <AdminTableCell className="py-3">
                        <div className="flex max-w-[320px] flex-col">
                          <span className="truncate font-semibold">{src.label}</span>
                          <span className="truncate font-mono text-label-sm normal-case tracking-normal text-text-3" title={src.url ?? src.externalId}>
                            {src.externalId}
                          </span>
                          {src.lastError ? (
                            <span className="mt-1 truncate text-body-sm text-danger" title={src.lastError}>
                              {src.lastError}
                            </span>
                          ) : null}
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <label className="flex min-h-9 cursor-pointer items-center gap-2 text-body-sm">
                          <Checkbox
                            checked={src.enabled}
                            disabled={isBusy || anyBusy}
                            aria-label={src.enabled ? `Desactivar ${src.label}` : `Activar ${src.label}`}
                            onCheckedChange={() => void toggleSource(src)}
                          />
                          <span className="text-text-3">{src.enabled ? "Sí" : "No"}</span>
                        </label>
                      </AdminTableCell>
                      <AdminTableCell mono className="whitespace-nowrap">
                        {fmtDateTime(src.lastFetchedAt)}
                      </AdminTableCell>
                      <AdminTableActions>
                        {src.url ? (
                          <RowAction label={`Abrir ${src.label}`} asChild>
                            <a href={src.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink />
                            </a>
                          </RowAction>
                        ) : null}
                        <RowAction label={`Borrar fuente ${src.label}`} className="hover:text-danger" disabled={anyBusy} onClick={() => setSourceDeleteTarget(src)}>
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

        <Dialog open={sourceOpen} onOpenChange={(o) => !sourceSaving && setSourceOpen(o)}>
          <DialogContent className={cn(adminDialogClass, "max-w-lg")}>
            <DialogHeader>
              <DialogTitle className="text-title">Añadir fuente</DialogTitle>
              <DialogDescription>Se revisará en cada sincronización.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <AdminField label="Tipo" htmlFor="social-source-kind">
                <AdminNativeSelect id="social-source-kind" value={sourceDraft.kind} onChange={(e) => setSourceDraft((p) => ({ ...p, kind: e.target.value as SocialSourceKind }))}>
                  {(Object.keys(SOURCE_KIND_META) as SocialSourceKind[]).map((k) => (
                    <option key={k} value={k}>
                      {SOURCE_KIND_META[k].label}
                    </option>
                  ))}
                </AdminNativeSelect>
              </AdminField>
              <AdminField label="URL o identificador" htmlFor="social-source-value" hint={SOURCE_KIND_META[sourceDraft.kind].hint}>
                <Input
                  id="social-source-value"
                  value={sourceDraft.value}
                  onChange={(e) => setSourceDraft((p) => ({ ...p, value: e.target.value }))}
                  placeholder={SOURCE_KIND_META[sourceDraft.kind].placeholder}
                />
              </AdminField>
              <AdminField label="Etiqueta (opcional)" htmlFor="social-source-label" hint="Nombre que verás en esta lista. Si se deja vacío se usa el del canal o página.">
                <Input
                  id="social-source-label"
                  value={sourceDraft.label}
                  onChange={(e) => setSourceDraft((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Facebook Sodimusic"
                  maxLength={80}
                />
              </AdminField>
            </div>
            <AdminDialogFooter>
              <Button type="button" variant="outline" disabled={sourceSaving} onClick={() => setSourceOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" loading={sourceSaving} onClick={() => void onSaveSource()}>
                Guardar
              </Button>
            </AdminDialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      {/* --------------------------- Publicaciones -------------------------- */}
      <section aria-labelledby="social-posts-title" className="space-y-4">
        <AdminSectionHeading
          id="social-posts-title"
          title="Publicaciones"
          description="Lo que se muestra en el feed público. Las ocultas no aparecen; las fijadas van siempre primero. Al sincronizar nunca se cambian estado ni fijado."
        />
        <AdminModuleToolbar
          sticky={false}
          search={
            <form onSubmit={onSearchSubmit} role="search" className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" aria-hidden />
                <Input
                  type="search"
                  name="q"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Buscar por título, autor, texto…"
                  aria-label="Buscar publicaciones"
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline" disabled={navPending} className="shrink-0">
                Buscar
              </Button>
            </form>
          }
          filters={
            <div className="flex items-center gap-2">
              <Label htmlFor="admin-social-status" className="text-text-2">
                Estado
              </Label>
              <AdminNativeSelect id="admin-social-status" className="w-auto min-w-[150px]" value={statusFilter} disabled={navPending} onChange={(e) => navigate({ status: e.target.value, page: 1 })}>
                <option value="ALL">Todas</option>
                <option value="VISIBLE">Visibles</option>
                <option value="HIDDEN">Ocultas</option>
              </AdminNativeSelect>
            </div>
          }
          action={
            <Button type="button" size="sm" onClick={openPostDialog}>
              <Plus aria-hidden /> Añadir enlace
            </Button>
          }
        />

        {posts.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={query || statusFilter !== "ALL" ? "Sin resultados" : "No hay publicaciones todavía"}
            description={query || statusFilter !== "ALL" ? "No hay publicaciones que coincidan con el filtro." : "Pulsa «Sincronizar ahora» o añade un enlace."}
          />
        ) : (
          <div className={cn("scroll-fade-x overflow-x-auto transition-opacity duration-150 md:[mask-image:none]", (navPending || refreshing) && "opacity-60")} aria-busy={navPending || refreshing}>
            <AdminTable>
              <AdminTableHead>
                <AdminTableRow>
                  <AdminTableHeader>Publicación</AdminTableHeader>
                  <AdminTableHeader>Red</AdminTableHeader>
                  <AdminTableHeader>Fecha</AdminTableHeader>
                  <AdminTableHeader>Estado</AdminTableHeader>
                  <AdminTableHeader align="right">
                    <span className="sr-only">Acciones</span>
                  </AdminTableHeader>
                </AdminTableRow>
              </AdminTableHead>
              <AdminTableBody>
                {posts.map((post) => {
                  const meta = POST_KIND_META[post.kind] ?? POST_KIND_META.LINK;
                  const isBusy = rowBusy === post.id;
                  const hidden = post.status === "HIDDEN";
                  return (
                    <AdminTableRow key={post.id} className={cn(isBusy && "opacity-60", hidden && "opacity-70")} data-post-id={post.id}>
                      <AdminTableCell className="py-3">
                        <div className="flex items-center gap-3">
                          {post.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.imageUrl} alt="" className="aspect-video w-20 shrink-0 rounded border border-line-1 object-cover" loading="lazy" />
                          ) : (
                            <div className="flex aspect-video w-20 shrink-0 items-center justify-center rounded border border-dashed border-line-2 bg-ink-1 text-text-3">
                              <meta.Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                            </div>
                          )}
                          <div className="flex min-w-0 max-w-[360px] flex-col">
                            <span className="line-clamp-2 font-semibold">
                              {post.pinned ? <Pin className="mr-1 inline h-4 w-4 text-gold-400" strokeWidth={1.75} aria-label="Fijada" /> : null}
                              {post.title}
                            </span>
                            {post.author ? <span className="text-body-sm text-text-2">{post.author}</span> : null}
                            <span className="truncate font-mono text-label-sm normal-case tracking-normal text-text-3" title={post.url}>
                              {post.url}
                            </span>
                          </div>
                        </div>
                      </AdminTableCell>
                      <AdminTableCell>
                        <Badge tone={meta.tone} icon={<meta.Icon aria-hidden />}>
                          {meta.label}
                        </Badge>
                      </AdminTableCell>
                      <AdminTableCell mono className="whitespace-nowrap">
                        {fmtDate(post.publishedAt)}
                      </AdminTableCell>
                      <AdminTableCell>
                        <Badge tone={hidden ? "neutral" : "success"}>{hidden ? "Oculta" : "Visible"}</Badge>
                      </AdminTableCell>
                      <AdminTableActions>
                        <RowAction
                          label={`${hidden ? "Mostrar" : "Ocultar"}: ${post.title}`}
                          variant="outline"
                          disabled={anyBusy}
                          onClick={() => void patchPost(post, { status: hidden ? "VISIBLE" : "HIDDEN" }, hidden ? "Publicación visible" : "Publicación oculta")}
                        >
                          {hidden ? <Eye /> : <EyeOff />}
                        </RowAction>
                        <RowAction
                          label={`${post.pinned ? "Desfijar" : "Fijar"}: ${post.title}`}
                          disabled={anyBusy}
                          className={cn(post.pinned && "text-gold-400")}
                          onClick={() => void patchPost(post, { pinned: !post.pinned }, post.pinned ? "Publicación desfijada" : "Publicación fijada")}
                        >
                          {post.pinned ? <PinOff /> : <Pin />}
                        </RowAction>
                        <RowAction label={`Abrir: ${post.title}`} asChild>
                          <a href={post.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink />
                          </a>
                        </RowAction>
                        <RowAction label={`Borrar: ${post.title}`} className="hover:text-danger" disabled={anyBusy} onClick={() => setPostDeleteTarget(post)}>
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

        <AdminResultsBar summary={`${total} ${total === 1 ? "publicación" : "publicaciones"} · Página ${Math.min(page, totalPages)} de ${totalPages}`}>
          <Pagination page={page} pageCount={totalPages} hrefFor={(p) => buildAdminHref({ q: query, status: statusFilter, page: p })} />
        </AdminResultsBar>

        <Dialog open={postOpen} onOpenChange={(o) => !postSaving && setPostOpen(o)}>
          <DialogContent className={cn(adminDialogClass, "max-w-xl")}>
            <DialogHeader>
              <DialogTitle className="text-title">Añadir enlace</DialogTitle>
              <DialogDescription>
                Pega la URL de un video de YouTube, una publicación de Facebook o cualquier página. El título y la imagen se completan solos si la página los expone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <AdminField label="URL" htmlFor="social-post-url">
                <Input
                  id="social-post-url"
                  type="url"
                  inputMode="url"
                  value={postDraft.url}
                  onChange={(e) => setPostDraft((p) => ({ ...p, url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=…"
                  autoFocus
                />
              </AdminField>
              <AdminField label="Título (opcional)" htmlFor="social-post-title" hint="Obligatorio solo si la página no ofrece metadatos (p. ej. Facebook sin token).">
                <Input id="social-post-title" value={postDraft.title} onChange={(e) => setPostDraft((p) => ({ ...p, title: e.target.value }))} maxLength={200} />
              </AdminField>
              <AdminField label="Texto (opcional)" htmlFor="social-post-text">
                <Textarea id="social-post-text" rows={3} className="min-h-[96px]" value={postDraft.text} onChange={(e) => setPostDraft((p) => ({ ...p, text: e.target.value }))} />
              </AdminField>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminField label="Imagen (opcional)" htmlFor="social-post-image" hint="URL de la miniatura.">
                  <Input
                    id="social-post-image"
                    type="url"
                    inputMode="url"
                    value={postDraft.imageUrl}
                    onChange={(e) => setPostDraft((p) => ({ ...p, imageUrl: e.target.value }))}
                    placeholder="https://…/imagen.jpg"
                  />
                </AdminField>
                <AdminField label="Fecha (opcional)" htmlFor="social-post-date" hint="Si se deja vacía se usa la de la página o la de hoy.">
                  <Input id="social-post-date" type="datetime-local" value={postDraft.publishedAt} onChange={(e) => setPostDraft((p) => ({ ...p, publishedAt: e.target.value }))} />
                </AdminField>
              </div>
            </div>
            <AdminDialogFooter>
              <Button type="button" variant="outline" disabled={postSaving} onClick={() => setPostOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" loading={postSaving} onClick={() => void onSavePost()}>
                Guardar
              </Button>
            </AdminDialogFooter>
          </DialogContent>
        </Dialog>
      </section>

      <AlertDialog open={sourceDeleteTarget !== null} onOpenChange={(o) => !o && !deleting && setSourceDeleteTarget(null)}>
        <AlertDialogContent className={adminDialogClass}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-title">¿Borrar esta fuente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se dejará de revisar «{sourceDeleteTarget?.label ?? ""}». Sus publicaciones ya importadas se conservan. Si solo quieres pausarla, desactívala.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <Button type="button" variant="danger" loading={deleting} onClick={() => void confirmDeleteSource()}>
              Borrar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={postDeleteTarget !== null} onOpenChange={(o) => !o && !deleting && setPostDeleteTarget(null)}>
        <AlertDialogContent className={adminDialogClass}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-title">¿Borrar esta publicación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará «{postDeleteTarget?.title ?? ""}» del feed. Si viene de una fuente activa, la próxima sincronización puede volver a importarla; si solo quieres que no se vea, usa «Ocultar».
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <Button type="button" variant="danger" loading={deleting} onClick={() => void confirmDeletePost()}>
              Borrar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCell({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded border border-line-1 bg-ink-1 p-4">
      <dt className="text-label text-text-3">{label}</dt>
      <dd className={cn("mt-2 font-mono tabular-nums text-text-1", small ? "text-body" : "text-display-sm")}>{value}</dd>
    </div>
  );
}
