"use client";

import { useEffect, useState } from "react";

const MESSAGES: Record<string, string> = {
  created: "✓ Propiedad creada",
  updated: "✓ Cambios guardados",
  deleted: "✓ Propiedad eliminada",
};

export function Toast({ ok }: { ok?: string }) {
  const [show, setShow] = useState(!!ok);
  useEffect(() => {
    if (!ok) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(t);
  }, [ok]);
  if (!show || !ok || !MESSAGES[ok]) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-ink text-paper px-7 py-4 rounded-2xl shadow-[0_24px_60px_-15px_rgba(28,39,71,0.45)] text-base font-medium animate-[toast-pop_0.3s_cubic-bezier(0.2,0.9,0.3,1)]"
    >
      {MESSAGES[ok]}
    </div>
  );
}
