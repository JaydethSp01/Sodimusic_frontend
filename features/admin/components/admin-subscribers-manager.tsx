"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Download, Mail, Search } from "lucide-react";
import { exportSubscribersCsvAction } from "@/app/actions/admin-crm-actions";
import { AdminPagination, formatDateTime } from "@/features/admin/components/admin-messages-manager";
import { AdminModuleToolbar } from "@/features/admin/components/admin-primitives";
import { AdminTable, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "@/components/ds/admin-table";
import { EmptyState } from "@/components/ds/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Paginated, Subscriber } from "@/types/models";

type Props = {
  data: Paginated<Subscriber>;
  q: string;
};

export function AdminSubscribersManager({ data, q }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(q);
  const [exporting, startExport] = useTransition();

  function hrefWith(patch: Record<string, string | null>): string {
    const p = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "" || (k === "page" && v === "1")) p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push(hrefWith({ q: value.trim(), page: null }));
  }

  function exportCsv() {
    startExport(async () => {
      const r = await exportSubscribersCsvAction();
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = r.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV descargado");
    });
  }

  const active = data.items.filter((s) => !s.unsubscribedAt).length;

  return (
    <div className="space-y-4">
      <AdminModuleToolbar
        search={
          <form onSubmit={submit} role="search" className="flex items-center gap-2">
            <label htmlFor="subscribers-q" className="sr-only">
              Buscar por correo o nombre
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-3" aria-hidden />
              <Input id="subscribers-q" type="search" placeholder="Buscar correo o nombre…" value={value} onChange={(e) => setValue(e.target.value)} className="pl-10" />
            </div>
            <Button type="submit" variant="outline" className="shrink-0">
              Buscar
            </Button>
          </form>
        }
        summary={`Suscriptores (${data.total}) · ${active} activos en esta página`}
        action={
          <Button type="button" size="sm" loading={exporting} onClick={exportCsv}>
            {exporting ? null : <Download aria-hidden />}
            Exportar CSV
          </Button>
        }
      />

      {data.items.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={q ? "Sin resultados" : "Todavía no hay suscriptores"}
          description={q ? `No encontramos nada para «${q}».` : "El formulario del boletín (footer) alimenta esta lista."}
        />
      ) : (
        <div className="scroll-fade-x overflow-x-auto md:[mask-image:none]">
          <AdminTable>
            <AdminTableHead>
              <AdminTableRow>
                <AdminTableHeader>Correo</AdminTableHeader>
                <AdminTableHeader>Nombre</AdminTableHeader>
                <AdminTableHeader>Estado</AdminTableHeader>
                <AdminTableHeader>Origen</AdminTableHeader>
                <AdminTableHeader>Alta</AdminTableHeader>
                <AdminTableHeader>Política</AdminTableHeader>
              </AdminTableRow>
            </AdminTableHead>
            <AdminTableBody>
              {data.items.map((s) => {
                const unsub = !!s.unsubscribedAt;
                return (
                  <AdminTableRow key={s.id} className={unsub ? "opacity-60" : undefined}>
                    <AdminTableCell className="font-semibold">
                      <a href={`mailto:${s.email}`} className="text-fire-400 underline-offset-4 transition-colors duration-150 hover:text-fire-300 hover:underline">
                        {s.email}
                      </a>
                    </AdminTableCell>
                    <AdminTableCell>{s.name ?? "—"}</AdminTableCell>
                    <AdminTableCell className="py-3">
                      <Badge tone={unsub ? "neutral" : "success"}>{unsub ? "Baja" : "Activo"}</Badge>
                      {unsub && s.unsubscribedAt ? (
                        <p className="mt-1 font-mono text-label-sm text-text-3">
                          <time suppressHydrationWarning dateTime={s.unsubscribedAt}>
                            {formatDateTime(s.unsubscribedAt)}
                          </time>
                        </p>
                      ) : null}
                    </AdminTableCell>
                    <AdminTableCell mono>{s.source}</AdminTableCell>
                    <AdminTableCell mono className="whitespace-nowrap">
                      <time suppressHydrationWarning dateTime={s.createdAt}>
                        {formatDateTime(s.createdAt)}
                      </time>
                    </AdminTableCell>
                    <AdminTableCell mono>{s.policyVersion}</AdminTableCell>
                  </AdminTableRow>
                );
              })}
            </AdminTableBody>
          </AdminTable>
        </div>
      )}
      <AdminPagination page={data.page} pageSize={data.pageSize} total={data.total} buildHref={(n) => hrefWith({ page: String(n) })} />
    </div>
  );
}
