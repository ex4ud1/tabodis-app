"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "@/components/icons";

export function ScrollProgressAndBackTop() {
  const [pct, setPct] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const next = h > 0 ? (window.scrollY / h) * 100 : 0;
      setPct(next);
      setShow(next > 35);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div id="scroll-progress" style={{ width: `${pct}%` }} aria-hidden="true" />
      <button
        id="back-top"
        className={show ? "visible" : ""}
        aria-label="Volver arriba"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={16} />
      </button>
    </>
  );
}
