"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminTable, AdminTableActions, AdminTableBody, AdminTableCell, AdminTableHead, AdminTableHeader, AdminTableRow } from "@/components/ds/admin-table";
import { EmptyState } from "@/components/ds/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminDialogFooter, RowAction, adminDialogClass } from "@/features/admin/components/admin-primitives";
import { deleteBookingSession, patchBookingSession } from "@/app/actions/admin-actions";
import { SERVICE_TYPE_LABELS, TIME_SLOT_LABELS } from "@/lib/constants";
import type { BookingSessionRow } from "@/types/models";
import { toast } from "sonner";
import { CalendarRange, FileText, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SESSION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

const STATUS_DOT: Record<string, string> = {
  PENDING: "bg-warning",
  CONFIRMED: "bg-success",
  COMPLETED: "bg-sea-400",
  CANCELLED: "bg-danger",
};

function formatServiceCell(serviceType: string): string {
  return serviceType
    .split(",")
    .map((x) => SERVICE_TYPE_LABELS[x.trim()] ?? x.trim())
    .join(", ");
}

export function SessionAdminTable({ sessions }: { sessions: BookingSessionRow[] }) {
  if (sessions.length === 0) {
    return <EmptyState icon={CalendarRange} title="Sin sesiones" description="No hay sesiones con estos filtros. Cambia el estado o el servicio, o crea una a mano." />;
  }
  return (
    <div className="scroll-fade-x overflow-x-auto md:[mask-image:none]">
      <AdminTable>
        <AdminTableHead>
          <AdminTableRow>
            <AdminTableHeader>Artista</AdminTableHeader>
            <AdminTableHeader>Servicio</AdminTableHeader>
            <AdminTableHeader>Fecha</AdminTableHeader>
            <AdminTableHeader>Franja</AdminTableHeader>
            <AdminTableHeader>Estado</AdminTableHeader>
            <AdminTableHeader align="right">
              <span className="sr-only">Acciones</span>
            </AdminTableHeader>
          </AdminTableRow>
        </AdminTableHead>
        <AdminTableBody>
          {sessions.map((row) => (
            <SessionRow key={row.id} row={row} />
          ))}
        </AdminTableBody>
      </AdminTable>
    </div>
  );
}

function SessionRow({ row }: { row: BookingSessionRow }) {
  const router = useRouter();
  const [status, setStatus] = useState(row.status);
  const [notes, setNotes] = useState(row.internalNotes ?? "");
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [statusPending, setStatusPending] = useState(false);
  const [notesPending, setNotesPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  async function onStatusChange(v: string) {
    setStatusPending(true);
    setStatus(v);
    try {
      const r = await patchBookingSession(row.id, { status: v });
      if (!r.ok) {
        toast.error(r.error ?? "Error");
        setStatus(row.status);
        return;
      }
      toast.success("Estado actualizado");
      router.refresh();
    } finally {
      setStatusPending(false);
    }
  }

  async function onDelete() {
    setDeletePending(true);
    try {
      const r = await deleteBookingSession(row.id);
      if (!r.ok) {
        toast.error(r.error ?? "Error");
        return;
      }
      toast.success("Sesión eliminada");
      setDeleteOpen(false);
      router.refresh();
    } finally {
      setDeletePending(false);
    }
  }

  async function saveNotes() {
    setNotesPending(true);
    try {
      const r = await patchBookingSession(row.id, { internalNotes: notes || null });
      if (!r.ok) {
        toast.error(r.error ?? "Error");
        return;
      }
      toast.success("Notas guardadas");
      router.refresh();
    } finally {
      setNotesPending(false);
    }
  }

  const scheduled = new Date(row.scheduledDate).toLocaleDateString("es-CO", {
    dateStyle: "medium",
  });

  return (
    <AdminTableRow className={cn(status === "CANCELLED" && "opacity-70")}>
      <AdminTableCell className="py-3">
        <div className="flex items-center gap-3">
          <Avatar name={row.artistName} size={40} />
          <div className="min-w-0">
            <p className="truncate font-semibold">{row.artistName}</p>
            <p className="truncate text-body-sm text-text-3">{row.artistEmail}</p>
          </div>
        </div>
      </AdminTableCell>
      <AdminTableCell className="max-w-[220px] py-3 text-body-sm leading-snug text-text-2">{formatServiceCell(row.serviceType)}</AdminTableCell>
      <AdminTableCell mono className="whitespace-nowrap">
        {scheduled}
      </AdminTableCell>
      <AdminTableCell>
        <Badge variant="outline">{TIME_SLOT_LABELS[row.timeSlot] ?? row.timeSlot}</Badge>
      </AdminTableCell>
      <AdminTableCell>
        <Select value={status} onValueChange={(v) => void onStatusChange(v)}>
          <SelectTrigger className="h-9 w-[150px] text-body-sm" disabled={statusPending} aria-label={`Estado para ${row.artistName}`}>
            <div className="flex items-center gap-2">
              {statusPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-fire-400" role="status" aria-label="Actualizando" />
              ) : (
                <span className={cn("h-2 w-2 shrink-0 rounded-full", STATUS_DOT[status] ?? "bg-text-3")} aria-hidden />
              )}
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map((s) => (
              <SelectItem key={s} value={s}>
                {SESSION_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </AdminTableCell>
      <AdminTableActions>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" size="sm" variant="outline">
              <FileText aria-hidden /> Ver briefing
            </Button>
          </DialogTrigger>
          <DialogContent className={adminDialogClass}>
            <DialogHeader>
              <DialogTitle className="text-title">Briefing — {row.artistName}</DialogTitle>
              <DialogDescription>
                {formatServiceCell(row.serviceType)} · {scheduled} · {TIME_SLOT_LABELS[row.timeSlot] ?? row.timeSlot}
              </DialogDescription>
            </DialogHeader>
            <dl className="grid gap-x-4 gap-y-3 text-body-sm sm:grid-cols-[auto_1fr]">
              <dt className="text-label text-text-3 sm:pt-0.5">Email</dt>
              <dd className="text-text-1">{row.artistEmail}</dd>
              <dt className="text-label text-text-3 sm:pt-0.5">Tel</dt>
              <dd className="font-mono text-text-1">{row.artistPhone}</dd>
              {row.artistInstagram ? (
                <>
                  <dt className="text-label text-text-3 sm:pt-0.5">IG</dt>
                  <dd className="text-text-1">@{row.artistInstagram}</dd>
                </>
              ) : null}
              <dt className="text-label text-text-3 sm:pt-0.5">Referencia</dt>
              <dd className="min-w-0">
                <a href={row.musicReference} target="_blank" rel="noopener noreferrer" className="break-all text-fire-400 underline-offset-4 hover:text-fire-300 hover:underline">
                  {row.musicReference}
                </a>
              </dd>
              {row.vision ? (
                <>
                  <dt className="text-label text-text-3 sm:pt-0.5">Visión</dt>
                  <dd className="whitespace-pre-wrap text-text-2">{row.vision}</dd>
                </>
              ) : null}
              <dt className="text-label text-text-3 sm:pt-0.5">Géneros</dt>
              <dd className="text-text-1">{row.genres}</dd>
            </dl>
            <div className="flex flex-col gap-2 border-t border-line-1 pt-4">
              <Label htmlFor={`notes-${row.id}`}>Notas internas</Label>
              <Textarea id={`notes-${row.id}`} value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="min-h-[96px]" />
              <div className="flex justify-end">
                <Button type="button" size="sm" loading={notesPending} onClick={() => void saveNotes()}>
                  {notesPending ? "Guardando…" : "Guardar notas"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <RowAction label={`Eliminar sesión de ${row.artistName}`} className="hover:text-danger">
              <Trash2 />
            </RowAction>
          </DialogTrigger>
          <DialogContent className={adminDialogClass}>
            <DialogHeader>
              <DialogTitle className="text-title">Eliminar sesión</DialogTitle>
              <DialogDescription>
                Se borrará la reserva de <strong className="text-text-1">{row.artistName}</strong> del {scheduled}. Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <AdminDialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button type="button" variant="danger" loading={deletePending} onClick={() => void onDelete()}>
                {deletePending ? "Eliminando…" : "Eliminar"}
              </Button>
            </AdminDialogFooter>
          </DialogContent>
        </Dialog>
      </AdminTableActions>
    </AdminTableRow>
  );
}
