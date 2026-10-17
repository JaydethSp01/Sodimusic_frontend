"use client";

import dynamic from "next/dynamic";

const Toaster = dynamic(() => import("sonner").then((m) => m.Toaster), { ssr: false });

/**
 * `Toaster` de sonner cargado bajo demanda (fuera del First Load JS). Móntalo UNA vez por página,
 * en el componente público que llama a `toast` (dos instancias duplicarían las notificaciones).
 */
export function LazyToaster() {
  return <Toaster richColors position="top-center" theme="dark" />;
}
