"use client";

import { GlobalUX } from "@/components/shared/global-ux";

/**
 * Proveedores de la raíz. `SessionProvider` (next-auth) y el `Toaster` de sonner ya no viven aquí:
 * el admin los monta en `components/admin-providers.tsx` y lo público usa `LazyToaster`
 * solo en los componentes que llaman a `toast` (tienda, beats, booking).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GlobalUX />
      {children}
    </>
  );
}
