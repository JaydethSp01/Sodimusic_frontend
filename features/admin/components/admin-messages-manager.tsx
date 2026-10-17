"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Archive,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Mail,
  MailOpen,
  Music2,
  Phone,
  RotateCcw,
  Search,
} from "lucide-react";
import { patchMessageStatusAction } from "@/app/actions/admin-crm-actions";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { BeatInterestRow, ContactMessage, ContactStatus, Paginated } from "@/types/models";

export type MessagesTab = "contacto" | "beats";

type Props = {
  tab: MessagesTab;
  messages: Paginated<ContactMessage>;
  status: string;
  interests: Paginated<BeatInterestRow>;
  q: string;
  subjectLabels: Record<string, string>;
  businessName: string;
};

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "NEW", label: "Nuevos" },
  { value: "READ", label: "Leídos" },
  { value: "ARCHIVED", label: "Archivados" },
];

const STATUS_LABEL: Record<ContactStatus, string> = { NEW: "Nuevo", READ: "Leído", ARCHIVED: "Archivado" };
const LICENSE_LABEL: Record<string, string> = { MP3: "MP3", WAV: "WAV", STEMS: "Stems", EXCLUSIVE: "Exclusiva" };

const dateFmt = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" });

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d);
}

/** Normaliza un teléfono a E.164 sin "+" si parece móvil (CO 10 dígitos que empieza por 3 → 57…). */
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("3")) return `57${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}

/** Paginación compartida por los listados del CRM (enlaces, conserva el resto de parámetros). */
export function AdminPagination({
  page,
  pageSize,
  total,
  buildHref,
}: {
  page: number;
  pageSize: number;
  total: number;
  buildHref: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  if (pages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav aria-label="Paginación" className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm">
      <p className="text-[var(--text-muted)]">
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline" className={cn(page <= 1 && "pointer-events-none opacity-40")}>
          <Link href={buildHref(page - 1)} aria-disabled={page <= 1} aria-label="Página anterior">
            <ChevronLeft className="h-4 w-4" aria-hidden /> Anterior
          </Link>
        </Button>
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {page} / {pages}
        </span>
        <Button asChild size="sm" variant="outline" className={cn(page >= pages && "pointer-events-none opacity-40")}>
          <Link href={buildHref(page + 1)} aria-disabled={page >= pages} aria-label="Página siguiente">
            Siguiente <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </nav>
  );
}

export function AdminMessagesManager({ tab, messages, status, interests, q, subjectLabels, businessName }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefWith(patch: Record<string, string | null>): string {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      const isPageKey = k === "page" || k === "bpage";
      if (v === null || v === "" || v === "all" || (isPageKey && v === "1")) p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <Tabs value={tab} onValueChange={(v) => router.push(hrefWith({ tab: v === "contacto" ? null : v }))}>
      <TabsList aria-label="Tipo de mensajes" className="h-auto flex-wrap">
        <TabsTrigger value="contacto" className="gap-2">
          <Inbox className="h-4 w-4" aria-hidden /> Contacto
          <span className="font-mono text-xs text-[var(--text-muted)]">{messages.total}</span>
        </TabsTrigger>
        <TabsTrigger value="beats" className="gap-2">
          <Music2 className="h-4 w-4" aria-hidden /> Beats
          <span className="font-mono text-xs text-[var(--text-muted)]">{interests.total}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="contacto" className="mt-4">
        <ContactMessagesPanel
          data={messages}
          status={status}
          subjectLabels={subjectLabels}
          buildStatusHref={(s) => hrefWith({ status: s, page: null })}
          buildPageHref={(n) => hrefWith({ page: String(n) })}
        />
      </TabsContent>

      <TabsContent value="beats" className="mt-4">
        <BeatInterestsPanel
          data={interests}
          q={q}
          businessName={businessName}
          onSearch={(value) => router.push(hrefWith({ tab: "beats", q: value, bpage: null }))}
          buildPageHref={(n) => hrefWith({ tab: "beats", bpage: String(n) })}
        />
      </TabsContent>
    </Tabs>
  );
}

function ContactMessagesPanel({
  data,
  status,
  subjectLabels,
  buildStatusHref,
  buildPageHref,
}: {
  data: Paginated<ContactMessage>;
  status: string;
  subjectLabels: Record<string, string>;
  buildStatusHref: (s: string) => string;
  buildPageHref: (n: number) => string;
}) {
  return (
    <Card className="border-white/10 bg-black/20">
      <CardHeader className="flex flex-col gap-3 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-semibold">Mensajes de contacto ({data.total})</CardTitle>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          {STATUS_FILTERS.map((s) => (
            <Button
              key={s.value}
              asChild
              size="sm"
              variant={status === s.value ? "default" : "outline"}
              className={cn(status !== s.value && "border-white/10 bg-black/20 text-[var(--text-secondary)]")}
            >
              <Link href={buildStatusHref(s.value)} aria-current={status === s.value ? "true" : undefined}>
                {s.label}
              </Link>
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {data.items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={status === "all" ? "Sin mensajes todavía" : "Nada en este filtro"}
            body={
              status === "all"
                ? "Cuando alguien escriba desde /contacto aparecerá aquí."
                : "Prueba con otro estado o vuelve a «Todos»."
            }
          />
        ) : (
          <ul className="space-y-3">
            {data.items.map((m) => (
              <MessageCard key={m.id} row={m} subjectLabel={subjectLabels[m.subject] ?? m.subject} />
            ))}
          </ul>
        )}
        <AdminPagination page={data.page} pageSize={data.pageSize} total={data.total} buildHref={buildPageHref} />
      </CardContent>
    </Card>
  );
}

function MessageCard({ row, subjectLabel }: { row: ContactMessage; subjectLabel: string }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(row.status === "NEW");
  const [busy, startTransition] = useTransition();
  const [current, setCurrent] = useState<ContactStatus>(row.status);
  const wa = toWhatsAppNumber(row.phone);
  const isLong = row.message.length > 220;

  function setStatus(next: ContactStatus, label: string) {
    startTransition(async () => {
      const r = await patchMessageStatusAction(row.id, next);
      if (!r.ok) {
        toast.error(r.error ?? "No se pudo actualizar");
        return;
      }
      setCurrent(next);
      toast.success(label);
      router.refresh();
    });
  }

  return (
    <li
      className={cn(
        "rounded-xl border p-4 transition-colors sm:p-5",
        current === "NEW" ? "border-primary/30 bg-primary/[0.05]" : "border-white/10 bg-black/20",
        current === "ARCHIVED" && "opacity-70",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={current === "NEW" ? "default" : "secondary"}>{STATUS_LABEL[current]}</Badge>
            <Badge variant="outline">{subjectLabel}</Badge>
            <time suppressHydrationWarning dateTime={row.createdAt} className="font-mono text-xs text-[var(--text-muted)]">
              {formatDateTime(row.createdAt)}
            </time>
          </div>
          <p className="font-medium text-foreground">{row.name}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <a href={`mailto:${row.email}`} className="inline-flex items-center gap-1.5 text-primary underline-offset-2 hover:underline">
              <Mail className="h-3.5 w-3.5" aria-hidden /> {row.email}
            </a>
            {row.phone ? (
              wa ? (
                <a
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[color:var(--whatsapp)] underline-offset-2 hover:underline"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" /> {row.phone}
                </a>
              ) : (
                <a href={`tel:${row.phone}`} className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                  <Phone className="h-3.5 w-3.5" aria-hidden /> {row.phone}
                </a>
              )
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {current === "NEW" ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setStatus("READ", "Marcado como leído")}>
              <MailOpen className="h-4 w-4" aria-hidden /> Marcar leído
            </Button>
          ) : null}
          {current !== "ARCHIVED" ? (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setStatus("ARCHIVED", "Mensaje archivado")}>
              <Archive className="h-4 w-4" aria-hidden /> Archivar
            </Button>
          ) : null}
          {current !== "NEW" ? (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setStatus("NEW", "Mensaje reabierto")}>
              <RotateCcw className="h-4 w-4" aria-hidden /> Reabrir
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        <p
          id={`msg-${row.id}`}
          className={cn("whitespace-pre-wrap text-sm leading-relaxed text-[var(--text-secondary)]", !expanded && isLong && "line-clamp-3")}
        >
          {row.message}
        </p>
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={`msg-${row.id}`}
            className="mt-2 inline-flex min-h-[32px] items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} aria-hidden />
            {expanded ? "Ver menos" : "Ver mensaje completo"}
          </button>
        ) : null}
      </div>
    </li>
  );
}

function BeatInterestsPanel({
  data,
  q,
  businessName,
  onSearch,
  buildPageHref,
}: {
  data: Paginated<BeatInterestRow>;
  q: string;
  businessName: string;
  onSearch: (q: string) => void;
  buildPageHref: (n: number) => string;
}) {
  const [value, setValue] = useState(q);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSearch(value.trim());
  }

  return (
    <Card className="border-white/10 bg-black/20">
      <CardHeader className="flex flex-col gap-3 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base font-semibold">Intereses en beats ({data.total})</CardTitle>
        <form onSubmit={submit} role="search" className="flex w-full max-w-md items-center gap-2">
          <label htmlFor="beat-interest-q" className="sr-only">
            Buscar por beat, artista o correo
          </label>
          <Input
            id="beat-interest-q"
            type="search"
            placeholder="Buscar beat, artista, correo…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-10 bg-background"
          />
          <Button type="submit" size="sm" variant="outline" className="h-10 shrink-0">
            <Search className="h-4 w-4" aria-hidden /> Buscar
          </Button>
        </form>
      </CardHeader>
      <CardContent className="pt-6">
        {data.items.length === 0 ? (
          <EmptyState
            icon={Music2}
            title={q ? "Sin resultados" : "Nadie ha pedido un beat todavía"}
            body={q ? `No encontramos nada para «${q}».` : "Los formularios «Me interesa» de /beats llegan aquí."}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Beat</TableHead>
                  <TableHead>Artista</TableHead>
                  <TableHead>Licencia</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Marketing</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((r) => {
                  const wa = toWhatsAppNumber(r.phone);
                  const license = r.licenseType ? LICENSE_LABEL[r.licenseType] ?? r.licenseType : r.exclusiveIntent ? "Exclusiva" : "—";
                  const text = `Hola ${r.artistName}, somos ${businessName}. Vimos tu interés en el beat «${r.beatTitle}»${
                    r.licenseType ? ` (licencia ${license})` : ""
                  }. ¿Seguimos por aquí?`;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.beatTitle}
                        {r.message ? (
                          <p className="mt-1 max-w-xs truncate text-xs text-[var(--text-muted)]" title={r.message}>
                            {r.message}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        {r.artistName}
                        {r.instagram ? <p className="text-xs text-[var(--text-muted)]">{r.instagram}</p> : null}
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.exclusiveIntent || r.licenseType === "EXCLUSIVE" ? "default" : "secondary"}>{license}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <a href={`mailto:${r.email}`} className="text-primary underline-offset-2 hover:underline">
                          {r.email}
                        </a>
                        {r.phone ? <p className="text-xs text-[var(--text-secondary)]">{r.phone}</p> : null}
                      </TableCell>
                      <TableCell>
                        <time suppressHydrationWarning dateTime={r.createdAt} className="font-mono text-xs">
                          {formatDateTime(r.createdAt)}
                        </time>
                      </TableCell>
                      <TableCell>{r.marketingOptIn ? "Sí" : "No"}</TableCell>
                      <TableCell className="text-right">
                        {wa ? (
                          <Button asChild size="sm" variant="outline" className="border-[color:var(--whatsapp)]/40 text-[color:var(--whatsapp)]">
                            <a href={`https://wa.me/${wa}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
                              <WhatsAppIcon className="h-4 w-4" /> Responder por WhatsApp
                            </a>
                          </Button>
                        ) : (
                          <Button asChild size="sm" variant="outline">
                            <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Beat «${r.beatTitle}»`)}&body=${encodeURIComponent(text)}`}>
                              <Mail className="h-4 w-4" aria-hidden /> Responder por correo
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <AdminPagination page={data.page} pageSize={data.pageSize} total={data.total} buildHref={buildPageHref} />
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Inbox;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <div className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-[var(--text-muted)]">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="max-w-sm text-sm text-[var(--text-muted)]">{body}</p>
    </div>
  );
}
