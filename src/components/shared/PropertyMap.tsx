"use client";

import dynamic from "next/dynamic";
import type { LeafletMapProps } from "./LeafletMap";

// next/dynamic with ssr:false must be called from a client module — Leaflet
// touches `window` on import and crashes during SSR otherwise.
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full grid place-items-center bg-bg-2 text-ink-soft text-xs font-mono uppercase tracking-widest rounded-2xl">
      Cargando mapa…
    </div>
  ),
});

export function PropertyMap(props: LeafletMapProps) {
  return <LeafletMap {...props} />;
}

export type { LeafletMapProps };
