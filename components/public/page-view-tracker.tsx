"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function apiBase(): string {
  const u = process.env.NEXT_PUBLIC_API_URL?.trim();
  return u ? u.replace(/\/+$/, "") : "";
}

/**
 * Envía una vista de página al backend (sin cookies). Ignora /admin.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const dedupe = useRef<{ path: string; t: number } | null>(null);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const base = apiBase();
    if (!base) return;

    const now = Date.now();
    const prev = dedupe.current;
    if (prev && prev.path === pathname && now - prev.t < 800) return;
    dedupe.current = { path: pathname, t: now };

    const url = `${base}/api/public/page-view`;
    const body = JSON.stringify({ path: pathname });
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        const ok = navigator.sendBeacon(url, blob);
        if (ok) return;
      }
    } catch {
      /* fall through */
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
