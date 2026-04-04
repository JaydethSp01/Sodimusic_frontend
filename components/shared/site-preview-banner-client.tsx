"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSitePreview } from "@/app/actions/site-preview";

export function SitePreviewBannerClient() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div
      role="status"
      className="fixed bottom-0 left-0 right-0 z-[200] border-t border-primary/40 bg-black/90 px-4 py-3 text-center text-sm text-foreground backdrop-blur-md"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <span className="text-primary">Vista previa del borrador</span>
      {" · "}
      <span className="text-[var(--text-secondary)]">Así verás los cambios antes de publicar.</span>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            await setSitePreview(false);
            router.refresh();
          })
        }
        className="ml-3 inline-flex items-center rounded-md border border-border px-3 py-1 text-xs font-medium hover:bg-background-elevated disabled:opacity-50"
      >
        Salir de vista previa
      </button>
    </div>
  );
}
