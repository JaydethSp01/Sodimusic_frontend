"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePlayerStore } from "@/features/beats/stores/player-store";

const BeatPlayerBar = dynamic(() => import("./beat-player-bar").then((m) => m.BeatPlayerBar), { ssr: false });

/**
 * Monta la barra global de reproducción solo cuando alguien pulsa play por primera vez
 * (`current` en el store). Hasta entonces, cero JS del reproductor en las rutas públicas.
 * Una vez montada se mantiene: la propia barra devuelve `null` cuando no hay pista y conserva
 * el único `<audio>` del sitio.
 */
export function BeatPlayerBarLazy() {
  const hasTrack = usePlayerStore((s) => s.current !== null);
  const [wanted, setWanted] = useState(false);

  useEffect(() => {
    if (hasTrack) {
      setWanted(true);
    }
  }, [hasTrack]);

  return wanted ? <BeatPlayerBar /> : null;
}
