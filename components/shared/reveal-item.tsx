import { createElement, type CSSProperties, type ReactNode } from "react";

/**
 * Ítem de un `<Reveal variant="stagger">` (ver `reveal.tsx`). No necesita JS propio: el contenedor
 * le asigna `--i` y `data-reveal-item="in"` al entrar en vista; el CSS hace el fade-up escalonado.
 * Sin "use client": se puede renderizar desde server components.
 */
export function RevealItem({
  as = "div",
  className,
  style,
  children,
}: {
  as?: "div" | "li";
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return createElement(as, { "data-reveal-item": "", className, style }, children);
}

/**
 * Respaldo sin JavaScript: si el script no corre, nada debe quedar en opacity 0.
 * Se monta una vez por página (lo hace el layout público).
 */
export function RevealNoScriptFallback() {
  return (
    <noscript>
      <style>{`[data-reveal],[data-reveal-item]{opacity:1!important;transform:none!important}`}</style>
    </noscript>
  );
}
