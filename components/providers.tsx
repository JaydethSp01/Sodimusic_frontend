"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { GlobalUX } from "@/components/shared/global-ux";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GlobalUX />
      {children}
      <Toaster richColors position="top-center" theme="dark" />
    </SessionProvider>
  );
}
