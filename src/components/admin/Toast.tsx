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
    <div className="fixed bottom-6 right-6 z-50 bg-ink text-paper px-5 py-3 rounded-full shadow-[0_12px_30px_-10px_rgba(28,39,71,0.4)] text-sm font-medium animate-[slide-up_0.35s_cubic-bezier(0.2,0.8,0.2,1)]">
      {MESSAGES[ok]}
    </div>
  );
}
