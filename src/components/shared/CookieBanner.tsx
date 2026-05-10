"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "tabodis_cookie_consent_v1";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  const accept = (mode: "all" | "essential") => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[55] bg-paper border border-line rounded-2xl shadow-[0_12px_40px_-16px_rgba(28,39,71,0.25)] p-5"
    >
      <p className="text-sm text-ink leading-[1.5] mb-4">
        Usamos cookies esenciales para que el sitio funcione, y opcionales para entender cómo se
        navega y mejorarlo. Puedes aceptarlas todas o solo las esenciales.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => accept("all")}
          className="px-4 py-2 rounded-full bg-ink text-paper text-[13px] font-medium border border-ink hover:bg-accent hover:border-accent transition-colors"
        >
          Aceptar todas
        </button>
        <button
          onClick={() => accept("essential")}
          className="px-4 py-2 rounded-full bg-transparent text-ink text-[13px] font-medium border border-line hover:border-ink transition-colors"
        >
          Solo esenciales
        </button>
      </div>
    </div>
  );
}
