"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  COOKIE_KEY,
  COOKIE_MAX_AGE,
  STORAGE_KEY,
  isLang,
  translate,
  type Lang,
  type TranslateFn,
} from "./lang-dict";

export type { Lang };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: TranslateFn;
};

const LangCtx = createContext<Ctx>({
  lang: "es",
  setLang: () => {},
  t: (k) => translate("es", k),
});

function writeCookie(lang: Lang) {
  if (typeof document === "undefined") return;
  // Path=/ so the cookie is sent for every route. SameSite=Lax is fine for a
  // user-language preference — no need for HttpOnly because client code reads
  // it too. Secure is auto-applied by browsers on https origins.
  document.cookie = `${COOKIE_KEY}=${lang}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function readCookie(): Lang | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_KEY}=([^;]+)`),
  );
  return match && isLang(match[1]) ? match[1] : null;
}

export function LangProvider({
  initialLang = "es",
  children,
}: {
  initialLang?: Lang;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [lang, setLangState] = useState<Lang>(initialLang);

  // On mount: reconcile cookie ↔ localStorage in case the user upgraded from
  // the legacy localStorage-only setup. Cookie is authoritative for SSR.
  useEffect(() => {
    let resolved: Lang | null = readCookie();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!resolved && isLang(stored)) resolved = stored;
      if (resolved) localStorage.setItem(STORAGE_KEY, resolved);
    } catch {
      /* ignore quota / privacy mode */
    }
    if (resolved && resolved !== lang) {
      setLangState(resolved);
      writeCookie(resolved);
    } else if (!readCookie() && resolved) {
      writeCookie(resolved);
    }
    // Run once on mount — `lang` intentionally omitted from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback(
    (l: Lang) => {
      setLangState(l);
      writeCookie(l);
      try {
        localStorage.setItem(STORAGE_KEY, l);
      } catch {
        /* ignore */
      }
      if (typeof document !== "undefined") {
        document.documentElement.lang = l;
      }
      // Re-render Server Components so they pick up the new cookie value
      // without a full page reload.
      router.refresh();
    },
    [router],
  );

  const t = useMemo<TranslateFn>(() => (key) => translate(lang, key), [lang]);

  return (
    <LangCtx.Provider value={{ lang, setLang, t }}>{children}</LangCtx.Provider>
  );
}

export const useLang = () => useContext(LangCtx);
