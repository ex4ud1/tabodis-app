"use client";

// Imports Leaflet directly — must be loaded only on the client.
// Use via `next/dynamic(..., { ssr: false })` in the parent wrapper.
import L, { Circle, LatLng, Map as LeafletMapType, Marker, TileLayer } from "leaflet";
import { useEffect, useRef } from "react";

// Default marker icons in Leaflet break under bundlers because the CSS paths
// resolve at runtime. We swap to a Supabase-storage-friendly inline SVG so the
// marker doesn't 404 silently.
const PIN_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <path d="M14 0C6.27 0 0 6.27 0 14c0 9.5 14 26 14 26s14-16.5 14-26C28 6.27 21.73 0 14 0z" fill="#e69664"/>
    <circle cx="14" cy="14" r="5" fill="#1c2747"/>
  </svg>`,
)}`;

const defaultIcon = L.icon({
  iconUrl: PIN_SVG,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -36],
});

export type LeafletMapProps = {
  lat: number | null;
  lng: number | null;
  /** Approximate-radius circle (metres). Pass 0 or null to hide. */
  radiusM?: number | null;
  /** When provided, clicks on the map call this with new coords. Readonly otherwise. */
  onPick?: (coords: { lat: number; lng: number }) => void;
  /** CSS class for the container; height must be set by the parent. */
  className?: string;
  /** Default centre when lat/lng are null (peninsular Spain). */
  fallbackCentre?: [number, number];
  /** Initial zoom when lat/lng are null. */
  fallbackZoom?: number;
  /** Zoom level applied when a coordinate is set. */
  pickedZoom?: number;
};

export default function LeafletMap({
  lat,
  lng,
  radiusM,
  onPick,
  className,
  fallbackCentre = [40.4168, -3.7038],
  fallbackZoom = 6,
  pickedZoom = 13,
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapType | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);
  const tileRef = useRef<TileLayer | null>(null);

  // Init map once.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;
    const map = L.map(container, {
      center: lat != null && lng != null ? [lat, lng] : fallbackCentre,
      zoom: lat != null && lng != null ? pickedZoom : fallbackZoom,
      zoomControl: true,
      attributionControl: true,
    });
    tileRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    // Leaflet caches the container's box at init. When the map is mounted
    // inside a modal that animates open, or below a scrolled fold, it can
    // measure 0 and never request tiles. Force a recompute after first paint
    // and whenever the container resizes.
    const raf = requestAnimationFrame(() => map.invalidateSize());
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
      tileRef.current = null;
    };
    // Re-running with new fallback would lose user-picked state; init runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bind/unbind click handler when picking mode changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!onPick) return;
    const handler = (e: L.LeafletMouseEvent) => {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [onPick]);

  // Sync marker + circle + view with the lat/lng/radius props.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (lat == null || lng == null) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (circleRef.current) {
        circleRef.current.remove();
        circleRef.current = null;
      }
      return;
    }
    const latlng = new LatLng(lat, lng);
    if (!markerRef.current) {
      markerRef.current = L.marker(latlng, { icon: defaultIcon }).addTo(map);
    } else {
      markerRef.current.setLatLng(latlng);
    }
    if (radiusM && radiusM > 0) {
      if (!circleRef.current) {
        circleRef.current = L.circle(latlng, {
          radius: radiusM,
          color: "#e69664",
          fillColor: "#e69664",
          fillOpacity: 0.18,
          weight: 1.5,
        }).addTo(map);
      } else {
        circleRef.current.setLatLng(latlng);
        circleRef.current.setRadius(radiusM);
      }
    } else if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }
    map.setView(latlng, Math.max(map.getZoom(), pickedZoom), { animate: true });
  }, [lat, lng, radiusM, pickedZoom]);

  return <div ref={containerRef} className={className} />;
}
