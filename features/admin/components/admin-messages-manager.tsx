"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Archive, ChevronDown, Inbox, Mail, MailOpen, Music2, Phone, RotateCcw, Search } from "lucide-react";
import { patchMessageStatusAction } from "@/app/actions/admin-crm-actions";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { AdminTable, AdminTableActions, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "@/components/ds/admin-table";
import { EmptyState } from "@/components/ds/empty-state";
import { Pagination } from "@/components/ds/pagination";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminModuleToolbar, AdminResultsBar } from "@/features/admin/components/admin-primitives";
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
const STATUS_TONE: Record<ContactStatus, BadgeTone> = { NEW: "fire", READ: "success", ARCHIVED: "neutral" };
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

/** Paginación de los listados del CRM: rango mono + `Pagination` del sistema (enlaces, conserva el resto de parámetros). */
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
    <AdminResultsBar summary={`${from}–${to} de ${total}`}>
      <Pagination page={page} pageCount={pages} hrefFor={buildHref} />
    </AdminResultsBar>
  );
}

const tabTriggerClass =
  "h-11 gap-2 rounded px-4 text-body-sm text-text-2 data-[state=active]:bg-ink-3 data-[state=active]:text-fire-300 data-[state=active]:shadow-none focus-visible:ring-fire-500 focus-visible:ring-offset-ink-0";

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
      <TabsList aria-label="Tipo de mensajes" className="h-auto flex-wrap gap-1 rounded-lg border border-line-1 bg-ink-1 p-1 text-text-2">
        <TabsTrigger value="contacto" className={tabTriggerClass}>
          <Inbox className="h-5 w-5" strokeWidth={1.75} aria-hidden /> Contacto
          <span className="font-mono text-label-sm text-text-3">{messages.total}</span>
        </TabsTrigger>
        <TabsTrigger value="beats" className={tabTriggerClass}>
          <Music2 className="h-5 w-5" strokeWidth={1.75} aria-hidden /> Beats
          <span className="font-mono text-label-sm text-text-3">{interests.total}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="contacto" className="mt-4 focus-visible:ring-fire-500 focus-visible:ring-offset-ink-0">
        <ContactMessagesPanel
          data={messages}
          status={status}
          subjectLabels={subjectLabels}
          buildStatusHref={(s) => hrefWith({ status: s, page: null })}
          buildPageHref={(n) => hrefWith({ page: String(n) })}
        />
      </TabsContent>

      <TabsContent value="beats" className="mt-4 focus-visible:ring-fire-500 focus-visible:ring-offset-ink-0">
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
    <div className="space-y-4">
      <AdminModuleToolbar
        filters={
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
            {STATUS_FILTERS.map((s) => (
              <Chip key={s.value} href={buildStatusHref(s.value)} selected={status === s.value}>
                {s.label}
              </Chip>
            ))}
          </div>
        }
        summary={`Mensajes de contacto (${data.total})`}
      />
      {data.items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={status === "all" ? "Sin mensajes todavía" : "Nada en este filtro"}
          description={status === "all" ? "Cuando alguien escriba desde /contacto aparecerá aquí." : "Prueba con otro estado o vuelve a «Todos»."}
        />
      ) : (
        <ul className="space-y-3">
          {data.items.map((m) => (
            <MessageCard key={m.id} row={m} subjectLabel={subjectLabels[m.subject] ?? m.subject} />
          ))}
        </ul>
      )}
      <AdminPagination page={data.page} pageSize={data.pageSize} total={data.total} buildHref={buildPageHref} />
    </div>
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
        "rounded-lg border bg-ink-2 p-4 shadow-card transition-colors duration-150 sm:p-5",
        current === "NEW" ? "border-line-fire" : "border-line-1",
        current === "ARCHIVED" && "opacity-70",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={row.name} size={40} className="mt-0.5" />
          <div className="min-w-0 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={STATUS_TONE[current]}>{STATUS_LABEL[current]}</Badge>
              <Badge variant="outline">{subjectLabel}</Badge>
              <time suppressHydrationWarning dateTime={row.createdAt} className="font-mono text-label-sm text-text-3">
                {formatDateTime(row.createdAt)}
              </time>
            </div>
            <p className="text-body font-semibold text-text-1">{row.name}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm">
              <a href={`mailto:${row.email}`} className="inline-flex min-h-6 items-center gap-1.5 text-fire-400 underline-offset-4 transition-colors duration-150 hover:text-fire-300 hover:underline">
                <Mail className="h-4 w-4" strokeWidth={1.75} aria-hidden /> {row.email}
              </a>
              {row.phone ? (
                wa ? (
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-6 items-center gap-1.5 text-whatsapp underline-offset-4 hover:underline"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> {row.phone}
                  </a>
                ) : (
                  <a href={`tel:${row.phone}`} className="inline-flex min-h-6 items-center gap-1.5 text-text-2">
                    <Phone className="h-4 w-4" strokeWidth={1.75} aria-hidden /> {row.phone}
                  </a>
                )
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {current === "NEW" ? (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setStatus("READ", "Marcado como leído")}>
              <MailOpen aria-hidden /> Marcar leído
            </Button>
          ) : null}
          {current !== "ARCHIVED" ? (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setStatus("ARCHIVED", "Mensaje archivado")}>
              <Archive aria-hidden /> Archivar
            </Button>
          ) : null}
          {current !== "NEW" ? (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => setStatus("NEW", "Mensaje reabierto")}>
              <RotateCcw aria-hidden /> Reabrir
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 sm:pl-[52px]">
        <p id={`msg-${row.id}`} className={cn("whitespace-pre-wrap text-body-sm leading-relaxed text-text-2", !expanded && isLong && "line-clamp-3")}>
          {row.message}
        </p>
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls={`msg-${row.id}`}
            className="mt-2 inline-flex min-h-9 cursor-pointer items-center gap-1 rounded text-body-sm font-medium text-fire-400 transition-colors duration-150 hover:text-fire-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fire-500 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-2"
          >
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-150", expanded && "rotate-180")} strokeWidth={1.75} aria-hidden />
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
    <div className="space-y-4">
      <AdminModuleToolbar
        search={
          <form onSubmit={submit} role="search" className="flex items-center gap-2">
            <label htmlFor="beat-interest-q" className="sr-only">
              Buscar por beat, artista o correo
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" aria-hidden />
              <Input id="beat-interest-q" type="search" placeholder="Buscar beat, artista, correo…" value={value} onChange={(e) => setValue(e.target.value)} className="pl-10" />
            </div>
            <Button type="submit" variant="outline" className="shrink-0">
              Buscar
            </Button>
          </form>
        }
        summary={`Intereses en beats (${data.total})`}
      />
      {data.items.length === 0 ? (
        <EmptyState
          icon={Music2}
          title={q ? "Sin resultados" : "Nadie ha pedido un beat todavía"}
          description={q ? `No encontramos nada para «${q}».` : "Los formularios «Me interesa» de /beats llegan aquí."}
        />
      ) : (
        <div className="scroll-fade-x overflow-x-auto md:[mask-image:none]">
          <AdminTable>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeader>Beat</AdminTableHeader>
                <AdminTableHeader>Artista</AdminTableHeader>
                <AdminTableHeader>Licencia</AdminTableHeader>
                <AdminTableHeader>Contacto</AdminTableHeader>
                <AdminTableHeader>Fecha</AdminTableHeader>
                <AdminTableHeader>Marketing</AdminTableHeader>
                <AdminTableHeader align="right">Acción</AdminTableHeader>
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {data.items.map((r) => {
                const wa = toWhatsAppNumber(r.phone);
                const exclusive = r.exclusiveIntent || r.licenseType === "EXCLUSIVE";
                const license = r.licenseType ? LICENSE_LABEL[r.licenseType] ?? r.licenseType : r.exclusiveIntent ? "Exclusiva" : "—";
                const text = `Hola ${r.artistName}, somos ${businessName}. Vimos tu interés en el beat «${r.beatTitle}»${
                  r.licenseType ? ` (licencia ${license})` : ""
                }. ¿Seguimos por aquí?`;
                return (
                  <AdminTableRow key={r.id}>
                    <AdminTableCell className="py-3">
                      <p className="font-semibold">{r.beatTitle}</p>
                      {r.message ? (
                        <p className="mt-0.5 max-w-xs truncate text-body-sm text-text-3" title={r.message}>
                          {r.message}
                        </p>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell className="py-3">
                      {r.artistName}
                      {r.instagram ? <p className="text-body-sm text-text-3">{r.instagram}</p> : null}
                    </AdminTableCell>
                    <AdminTableCell>
                      <Badge tone={exclusive ? "gold" : "neutral"}>{license}</Badge>
                    </AdminTableCell>
                    <AdminTableCell className="py-3">
                      <a href={`mailto:${r.email}`} className="text-fire-400 underline-offset-4 hover:text-fire-300 hover:underline">
                        {r.email}
                      </a>
                      {r.phone ? <p className="font-mono text-body-sm text-text-2">{r.phone}</p> : null}
                    </AdminTableCell>
                    <AdminTableCell mono className="whitespace-nowrap">
                      <time suppressHydrationWarning dateTime={r.createdAt}>
                        {formatDateTime(r.createdAt)}
                      </time>
                    </AdminTableCell>
                    <AdminTableCell>{r.marketingOptIn ? "Sí" : "No"}</AdminTableCell>
                    <AdminTableActions>
                      {wa ? (
                        <Button asChild size="sm" variant="outline" className="border-whatsapp/40 text-whatsapp hover:border-whatsapp hover:text-whatsapp">
                          <a href={`https://wa.me/${wa}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
                            <WhatsAppIcon className="h-4 w-4" /> Responder por WhatsApp
                          </a>
                        </Button>
                      ) : (
                        <Button asChild size="sm" variant="outline">
                          <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Beat «${r.beatTitle}»`)}&body=${encodeURIComponent(text)}`}>
                            <Mail aria-hidden /> Responder por correo
                          </a>
                        </Button>
                      )}
                    </AdminTableActions>
                  </AdminTableRow>
                );
              })}
            </AdminTableBody>
          </AdminTable>
        </div>
      )}
      <AdminPagination page={data.page} pageSize={data.pageSize} total={data.total} buildHref={buildPageHref} />
    </div>
  );
}
