import * as React from "react";
import { cn } from "@/lib/utils";

/** Tabla admin: cabecera mono, filas 56 px, hover ink-3, acciones a la derecha. */
export function AdminTable({ className, children, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-lg border border-line-1 bg-ink-2">
      <table className={cn("w-full caption-bottom text-body-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

export function AdminTableHead({ className, children, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={cn("[&_tr]:border-b [&_tr]:border-line-2 [&_tr:hover]:bg-transparent", className)} {...props}>
      {children}
    </thead>
  );
}

export function AdminTableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function AdminTableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn("h-14 border-b border-line-1 transition-colors duration-150 hover:bg-ink-3 data-[state=selected]:bg-fire-500/[0.08]", className)}
      {...props}
    />
  );
}

export function AdminTableHeader({ className, align = "left", ...props }: React.ThHTMLAttributes<HTMLTableCellElement> & { align?: "left" | "right" | "center" }) {
  return (
    <th
      scope="col"
      className={cn(
        "h-11 px-4 align-middle text-label text-text-3",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className,
      )}
      {...props}
    />
  );
}

export function AdminTableCell({ className, mono = false, align = "left", ...props }: React.TdHTMLAttributes<HTMLTableCellElement> & { mono?: boolean; align?: "left" | "right" | "center" }) {
  return (
    <td
      className={cn(
        "px-4 align-middle text-text-1",
        mono && "font-mono tabular-nums text-text-2",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className,
      )}
      {...props}
    />
  );
}

/** Celda de acciones (alineada a la derecha, botones sm/icon). */
export function AdminTableActions({ className, children, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("px-4 align-middle", className)} {...props}>
      <div className="flex items-center justify-end gap-1">{children}</div>
    </td>
  );
}
