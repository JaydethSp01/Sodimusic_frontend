"use client";

import { useEffect, useState } from "react";

function useScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setP(max <= 0 ? 0 : doc.scrollTop / max);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return p;
}

export function GlobalUX() {
  const progress = useScrollProgress();

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[100] h-0.5 w-full bg-primary/20"
      aria-hidden
    >
      <div
        className="pointer-events-none h-full bg-primary transition-[width] duration-100 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
