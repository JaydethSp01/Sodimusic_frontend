"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { Download, Loader2, Mail, Search } from "lucide-react";
import { exportSubscribersCsvAction } from "@/app/actions/admin-crm-actions";
import {
  AdminPagination,
  EmptyState,
  formatDateTime,
} from "@/features/admin/components/admin-messages-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
    <Card className="border-white/10 bg-black/20">
      <CardHeader className="flex flex-col gap-3 border-b border-white/5 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-base font-semibold">
          Suscriptores ({data.total})
          <span className="ml-2 font-mono text-xs font-normal text-[var(--text-muted)]">
            {active} activos en esta página
          </span>
        </CardTitle>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <form onSubmit={submit} role="search" className="flex items-center gap-2">
            <label htmlFor="subscribers-q" className="sr-only">
              Buscar por correo o nombre
            </label>
            <Input
              id="subscribers-q"
              type="search"
              placeholder="Buscar correo o nombre…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-10 w-full bg-background sm:w-64"
            />
            <Button type="submit" size="sm" variant="outline" className="h-10 shrink-0">
              <Search className="h-4 w-4" aria-hidden /> Buscar
            </Button>
          </form>
          <Button type="button" size="sm" className="h-10" disabled={exporting} onClick={exportCsv}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {data.items.length === 0 ? (
          <EmptyState
            icon={Mail}
            title={q ? "Sin resultados" : "Todavía no hay suscriptores"}
            body={q ? `No encontramos nada para «${q}».` : "El formulario del boletín (footer) alimenta esta lista."}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead>Alta</TableHead>
                  <TableHead>Política</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((s) => {
                  const unsub = !!s.unsubscribedAt;
                  return (
                    <TableRow key={s.id} className={unsub ? "opacity-60" : undefined}>
                      <TableCell className="font-medium">
                        <a href={`mailto:${s.email}`} className="text-primary underline-offset-2 hover:underline">
                          {s.email}
                        </a>
                      </TableCell>
                      <TableCell>{s.name ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={unsub ? "secondary" : "default"}>{unsub ? "Baja" : "Activo"}</Badge>
                        {unsub && s.unsubscribedAt ? (
                          <p className="mt-1 font-mono text-[10px] text-[var(--text-muted)]">
                            <time suppressHydrationWarning dateTime={s.unsubscribedAt}>{formatDateTime(s.unsubscribedAt)}</time>
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{s.source}</TableCell>
                      <TableCell>
                        <time suppressHydrationWarning dateTime={s.createdAt} className="font-mono text-xs">
                          {formatDateTime(s.createdAt)}
                        </time>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{s.policyVersion}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <AdminPagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          buildHref={(n) => hrefWith({ page: String(n) })}
        />
      </CardContent>
    </Card>
  );
}
