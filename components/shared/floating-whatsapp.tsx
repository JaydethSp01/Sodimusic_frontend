"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { IconButton } from "@/components/ui/icon-button";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

export type FloatingWhatsappConfig = {
  enabled: boolean;
  /** E.164 sin + */
  phone: string;
  businessName: string;
};

type Props = {
  /** Si no se pasa, el botón carga la configuración pública del sitio (/api/site-config) en el cliente. */
  config?: FloatingWhatsappConfig;
};

const CACHE_KEY = "sodimusic:floating-wa";
const CACHE_TTL_MS = 5 * 60 * 1000;

function apiBase(): string {
  const u = process.env.NEXT_PUBLIC_API_URL?.trim();
  return u ? u.replace(/\/+$/, "") : "";
}

function readCache(): FloatingWhatsappConfig | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { t: number; c: FloatingWhatsappConfig };
    if (Date.now() - parsed.t > CACHE_TTL_MS) return null;
    return parsed.c;
  } catch {
    return null;
  }
}

function writeCache(c: FloatingWhatsappConfig) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), c }));
  } catch {
    /* almacenamiento bloqueado: sin caché */
  }
}

async function loadConfig(): Promise<FloatingWhatsappConfig | null> {
  const cached = readCache();
  if (cached) return cached;
  const base = apiBase();
  const envPhone = process.env.NEXT_PUBLIC_WHATSAPP?.trim() ?? "";
  if (!base) return envPhone ? { enabled: true, phone: envPhone, businessName: "Sodimusic" } : null;
  try {
    const res = await fetch(`${base}/api/site-config`, { cache: "default" });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as {
      content?: { legal?: { floatingWhatsapp?: boolean; phone?: string; businessName?: string }; contact?: { whatsapp?: string } };
    };
    const legal = data.content?.legal;
    const c: FloatingWhatsappConfig = {
      enabled: legal?.floatingWhatsapp ?? true,
      phone: (legal?.phone || data.content?.contact?.whatsapp || envPhone || "").replace(/\D/g, ""),
      businessName: legal?.businessName || "Sodimusic",
    };
    writeCache(c);
    return c;
  } catch {
    return envPhone ? { enabled: true, phone: envPhone, businessName: "Sodimusic" } : null;
  }
}

/** Mensaje precargado según la sección que visita la persona. */
export function whatsappMessageFor(pathname: string, businessName: string): string {
  const b = businessName || "Sodimusic";
  if (pathname.startsWith("/beats")) return `Hola ${b}, me interesa un beat del catálogo. ¿Me cuentan precios y licencias?`;
  if (pathname.startsWith("/tienda")) return `Hola ${b}, quiero hacer un pedido de la tienda. ¿Me ayudan con disponibilidad y envío?`;
  if (pathname.startsWith("/booking")) return `Hola ${b}, quiero agendar una sesión en el estudio. ¿Qué disponibilidad tienen?`;
  if (pathname.startsWith("/canales")) return `Hola ${b}, me gustaría colaborar o sumar mi canal. ¿Hablamos?`;
  if (pathname.startsWith("/releases")) return `Hola ${b}, vi un lanzamiento en la web y quiero saber más.`;
  if (pathname.startsWith("/artists")) return `Hola ${b}, quiero saber más sobre el crew y cómo trabajar con ustedes.`;
  return `Hola ${b}, vengo de la página web y quiero más información.`;
}

/**
 * Rutas donde el pie de la pantalla ya tiene botones (wizard de booking, barra de compra): subimos el botón.
 * Se suma `--player-bar-h` (alto de la barra global de beats, 0 si no está) para no solaparse con ella.
 */
function bottomOffsetFor(pathname: string): string {
  const base = pathname.startsWith("/booking") || pathname.startsWith("/tienda/") ? "5rem" : "1.25rem";
  return `calc(${base} + var(--player-bar-h, 0px))`;
}

const BOTTOM_OFFSET_DESKTOP = "calc(1.5rem + var(--player-bar-h, 0px))";

/**
 * Botón flotante de WhatsApp (`IconButton` whatsapp 52 px) con mensaje precargado según la ruta.
 * Oculto en /admin. Respeta safe-area-inset y `--player-bar-h`; va en `z-player` (bajo overlays y modales).
 */
export function FloatingWhatsapp({ config }: Props) {
  const pathname = usePathname() ?? "/";
  const [loaded, setLoaded] = useState<FloatingWhatsappConfig | null>(config ?? null);
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (config || isAdmin) return;
    let cancelled = false;
    const run = () => {
      void loadConfig().then((c) => {
        if (!cancelled && c) setLoaded(c);
      });
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
    if (typeof w.requestIdleCallback === "function") w.requestIdleCallback(run, { timeout: 2000 });
    else setTimeout(run, 300);
    return () => {
      cancelled = true;
    };
  }, [config, isAdmin]);

  const cfg = config ?? loaded;
  if (isAdmin || !cfg || !cfg.enabled || !cfg.phone) return null;

  const href = `https://wa.me/${cfg.phone}?text=${encodeURIComponent(whatsappMessageFor(pathname, cfg.businessName))}`;

  return (
    <IconButton
      asChild
      variant="whatsapp"
      size="lg"
      aria-label={`Escribir a ${cfg.businessName} por WhatsApp`}
      className="group fixed bottom-[var(--wa-bottom)] right-4 z-player shadow-[0_10px_30px_rgba(37,211,102,0.35)] focus-visible:ring-offset-ink-0 md:bottom-[var(--wa-bottom-md)] md:right-6"
      style={
        {
          marginBottom: "env(safe-area-inset-bottom, 0px)",
          "--wa-bottom": bottomOffsetFor(pathname),
          "--wa-bottom-md": BOTTOM_OFFSET_DESKTOP,
        } as CSSProperties
      }
    >
      <a href={href} target="_blank" rel="noopener noreferrer" title="Escríbenos por WhatsApp">
        <WhatsAppIcon />
        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded border border-line-2 bg-ink-3 px-3 py-1.5 text-body-sm text-text-1 opacity-0 shadow-pop transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
          Escríbenos por WhatsApp
        </span>
      </a>
    </IconButton>
  );
}
