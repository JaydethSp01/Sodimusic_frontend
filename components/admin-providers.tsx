"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";

/** Proveedores solo del admin: sesión de next-auth y notificaciones (sonner). */
export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster richColors position="top-center" theme="dark" />
    </SessionProvider>
  );
}
