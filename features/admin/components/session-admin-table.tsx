"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { deleteBookingSession, patchBookingSession } from "@/app/actions/admin-actions";
import { SERVICE_TYPE_LABELS, TIME_SLOT_LABELS } from "@/lib/constants";
import type { BookingSessionRow } from "@/types/models";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const SESSION_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
};

function formatServiceCell(serviceType: string): string {
  return serviceType
    .split(",")
    .map((x) => SERVICE_TYPE_LABELS[x.trim()] ?? x.trim())
    .join(", ");
}

export function SessionAdminTable({ sessions }: { sessions: BookingSessionRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Artista</TableHead>
          <TableHead>Servicio</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Slot</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((row) => (
          <SessionRow key={row.id} row={row} />
        ))}
      </TableBody>
    </Table>
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
    <TableRow>
      <TableCell>{row.artistName}</TableCell>
      <TableCell className="max-w-[180px] text-xs leading-snug">
        {formatServiceCell(row.serviceType)}
      </TableCell>
      <TableCell className="whitespace-nowrap font-mono text-xs">{scheduled}</TableCell>
      <TableCell className="text-xs">{TIME_SLOT_LABELS[row.timeSlot] ?? row.timeSlot}</TableCell>
      <TableCell>
        <Select value={status} onValueChange={(v) => void onStatusChange(v)}>
          <SelectTrigger
            className="h-8 w-[140px]"
            disabled={statusPending}
            aria-label={`Estado para ${row.artistName}`}
          >
            <div className="flex items-center gap-2">
              {statusPending ? (
                <span
                  className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
                  role="status"
                  aria-label="Actualizando"
                />
              ) : null}
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
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" size="sm" variant="outline">
              Ver briefing
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Briefing — {row.artistName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Email:</strong> {row.artistEmail}
              </p>
              <p>
                <strong>Tel:</strong> {row.artistPhone}
              </p>
              {row.artistInstagram ? (
                <p>
                  <strong>IG:</strong> @{row.artistInstagram}
                </p>
              ) : null}
              <p>
                <strong>Referencia:</strong>{" "}
                <a href={row.musicReference} target="_blank" rel="noopener noreferrer" className="text-primary">
                  {row.musicReference}
                </a>
              </p>
              {row.vision ? (
                <p>
                  <strong>Visión:</strong> {row.vision}
                </p>
              ) : null}
              <p>
                <strong>Géneros:</strong> {row.genres}
              </p>
              <div>
                <p className="mb-1 font-medium">Notas internas</p>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
                <Button
                  type="button"
                  className="mt-2"
                  size="sm"
                  disabled={notesPending}
                  onClick={() => void saveNotes()}
                >
                  {notesPending ? (
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
                        role="status"
                        aria-label="Guardando"
                      />
                      Guardando…
                    </span>
                  ) : (
                    "Guardar notas"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-950/40 hover:text-red-300"
              aria-label={`Eliminar sesión de ${row.artistName}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="border-white/10 bg-background-card">
            <DialogHeader>
              <DialogTitle>Eliminar sesión</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-[var(--text-secondary)]">
              Se borrará la reserva de <strong className="text-foreground">{row.artistName}</strong> del{" "}
              {scheduled}. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deletePending}
                onClick={() => void onDelete()}
              >
                {deletePending ? "Eliminando…" : "Eliminar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </TableCell>
    </TableRow>
  );
}
