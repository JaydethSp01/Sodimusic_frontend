"use client";

import { Toaster } from "sonner";
import { toasterClassNames } from "@/components/shared/lazy-toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

/**
 * Proveedores solo del admin: notificaciones (sonner) y tooltips de las acciones de fila.
 * Sin `SessionProvider`: nadie usa `useSession` y su polling a /api/auth/session reemitía la cookie
 * de sesión en paralelo al logout, dejando al usuario conectado.
 */
export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={300}>
      {children}
      <Toaster position="top-center" theme="dark" toastOptions={{ classNames: toasterClassNames }} />
    </TooltipProvider>
  );
}
