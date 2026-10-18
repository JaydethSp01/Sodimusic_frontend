"use client";

import dynamic from "next/dynamic";

const Toaster = dynamic(() => import("sonner").then((m) => m.Toaster), { ssr: false });

/** Clases de sonner con los tokens del sistema (compartidas con el `Toaster` del admin). */
export const toasterClassNames = {
  toast: "!rounded !border !border-line-2 !bg-ink-3 !text-text-1 !shadow-pop font-body !text-body-sm",
  title: "!font-semibold",
  description: "!text-text-2",
  success: "[&_[data-icon]]:!text-success",
  error: "[&_[data-icon]]:!text-danger",
  warning: "[&_[data-icon]]:!text-warning",
  info: "[&_[data-icon]]:!text-sea-400",
  actionButton: "!bg-fire-500 !text-fire-on",
  cancelButton: "!bg-ink-4 !text-text-1",
};

/**
 * `Toaster` de sonner cargado bajo demanda (fuera del First Load JS). Móntalo UNA vez por página,
 * en el componente público que llama a `toast` (dos instancias duplicarían las notificaciones).
 */
export function LazyToaster() {
  return <Toaster position="top-center" theme="dark" toastOptions={{ classNames: toasterClassNames }} />;
}
