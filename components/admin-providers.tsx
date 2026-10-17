"use client";

import { Toaster } from "sonner";

/**
 * Proveedores solo del admin: notificaciones (sonner).
 * Sin `SessionProvider`: nadie usa `useSession` y su polling a /api/auth/session reemitía la cookie
 * de sesión en paralelo al logout, dejando al usuario conectado.
 */
export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-center" theme="dark" />
    </>
  );
}
