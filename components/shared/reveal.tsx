"use client";

import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Revelado al entrar en vista sin framer-motion: IntersectionObserver + Web Animations API.
 * Equivale a `whileInView="visible"` con `viewport={{ once: true, amount: 0.1 }}` (mismas curvas y
 * duraciones que tenían `fadeInUp`/`staggerContainer` en `lib/animations.ts`).
 *
 * - Variantes: `fade` (opacity 0→1, y 24→0, 0.5 s), `figure` (opacity + scale 0.985, 0.75 s), `card` (y 18, 0.45 s)
 *   y `stagger` (el contenedor no se oculta; sus `RevealItem` entran escalonados cada 80 ms).
 * - El HTML del servidor lleva `data-reveal=""` / `data-reveal-item=""` (ocultos por CSS en `globals.css`,
 *   como el `initial="hidden"` anterior); al entrar en vista se marcan `in` y se animan con `element.animate`
 *   (fill `backwards`: al terminar no queda ningún estilo, los `hover:-translate-y-*` siguen funcionando y un
 *   cambio de `display` no la repite, a diferencia de una animación CSS).
 * - `RevealNoScriptFallback` lo muestra todo si no hay JS; `prefers-reduced-motion` lo muestra sin animar.
 */
export type RevealVariant = "fade" | "stagger" | "figure" | "card";

export const REVEAL_AMOUNT = 0.1;
const EASE = "cubic-bezier(0.25, 0.1, 0.25, 1)";
const STAGGER_MS = 80;
const VISIBLE: Keyframe = { opacity: 1, transform: "none" };
const ENTER: Record<Exclude<RevealVariant, "stagger">, { from: Keyframe; duration: number }> = {
  fade: { from: { opacity: 0, transform: "translateY(24px)" }, duration: 500 },
  figure: { from: { opacity: 0, transform: "scale(0.985)" }, duration: 750 },
  card: { from: { opacity: 0, transform: "translateY(18px)" }, duration: 450 },
};

type RevealTag = "section" | "div" | "figure" | "ul" | "ol" | "article";

export interface RevealProps {
  as?: RevealTag;
  variant?: RevealVariant;
  className?: string;
  id?: string;
  style?: CSSProperties;
  children: ReactNode;
  "aria-labelledby"?: string;
  "aria-label"?: string;
}

function animateIn(node: HTMLElement, from: Keyframe, duration: number, delay = 0) {
  if (typeof node.animate !== "function") {
    return;
  }
  node.animate([from, VISIBLE], { duration, delay, easing: EASE, fill: "backwards" });
}

export function Reveal({ as = "div", variant = "fade", children, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) {
      return;
    }
    // Ítems escalonados cuyo contenedor más cercano es este.
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal-item]")).filter(
      (item) => item.closest("[data-reveal]") === el,
    );
    const show = () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      items.forEach((item, i) => {
        item.dataset.revealItem = "in";
        if (!reduce) {
          animateIn(item, ENTER.fade.from, ENTER.fade.duration, i * STAGGER_MS);
        }
      });
      if (!reduce && variant !== "stagger") {
        animateIn(el, ENTER[variant].from, ENTER[variant].duration);
      }
      setInView(true);
    };
    if (typeof IntersectionObserver === "undefined") {
      show();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          show();
        }
      },
      { threshold: REVEAL_AMOUNT },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, variant]);

  return createElement(
    as,
    { ref, "data-reveal": inView ? "in" : "", "data-reveal-variant": variant, ...rest },
    children,
  );
}
