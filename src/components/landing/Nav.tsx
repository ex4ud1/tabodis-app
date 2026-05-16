"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Arrow, ArrowDown, Close, Menu, Moon, Sun } from "@/components/icons";
import { useLang, type Lang } from "@/lib/i18n";

const NAV_LINKS: { href: string; key: string }[] = [
  { href: "#inicio", key: "nav.inicio" },
  { href: "#propiedades", key: "nav.propiedades" },
  { href: "#servicios", key: "nav.servicios" },
  { href: "#nosotros", key: "nav.nosotros" },
  { href: "#testimonios", key: "nav.testimonios" },
  { href: "#contacto", key: "nav.contacto" },
];

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "uk", label: "UA", flag: "🇺🇦" },
  { code: "ru", label: "RU", flag: "🇷🇺" },
];

export function Nav() {
  const { lang, setLang, t } = useLang();
  const [floating, setFloating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("inicio");
  const [dark, setDark] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setFloating(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    if (sections.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveId(e.target.id);
        });
      },
      { threshold: 0.25, rootMargin: "-70px 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-palette", next ? "navy" : "cream");
  };

  const closeMenu = () => setMenuOpen(false);
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  const themeLabel = dark ? t("common.theme_light") : t("common.theme_dark");

  return (
    <nav
      className={[
        "sticky top-0 z-50 transition-[padding] duration-300",
        floating ? "py-3.5 px-4" : "px-4",
      ].join(" ")}
    >
      <div
        className={[
          "transition-all duration-[0.35s]",
          floating
            ? "max-w-[1100px] mx-auto bg-paper/85 border border-line rounded-full shadow-[0_12px_40px_-16px_rgba(28,39,71,0.25)] backdrop-blur"
            : "border-b border-transparent",
        ].join(" ")}
      >
        <div
          className={[
            "wrap flex items-center justify-between",
            floating ? "py-2.5 pl-5 pr-3.5" : "py-4",
          ].join(" ")}
        >
          <a
            href="#inicio"
            className="font-serif text-[38px] tracking-[-0.04em] text-ink leading-[0.85] inline-flex items-baseline"
          >
            Tabo<em className="italic text-accent">·</em>dis<em className="italic text-accent">.</em>
          </a>

          <div className="hidden md:flex gap-9 items-center">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={[
                  "text-[13px] font-medium tracking-[0.02em] py-1.5 relative",
                  "after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-0.5 after:h-px",
                  "after:transition-transform after:duration-300 after:origin-left",
                  activeId === l.href.slice(1)
                    ? "text-accent-deep after:scale-x-100 after:bg-accent"
                    : "text-ink after:scale-x-0 hover:after:scale-x-100 after:bg-ink",
                ].join(" ")}
              >
                {t(l.key)}
              </a>
            ))}
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={toggleTheme}
              aria-label={themeLabel}
              title={themeLabel}
              className="relative w-14 h-[30px] rounded-full bg-ink/10 border border-line hover:border-ink transition-all flex items-center"
            >
              <span
                className={[
                  "absolute top-0.5 w-6 h-6 rounded-full bg-paper shadow flex items-center justify-center text-ink transition-transform duration-[0.35s]",
                  dark ? "translate-x-[26px] bg-accent text-white" : "left-0.5",
                ].join(" ")}
              >
                {dark ? <Moon size={12} /> : <Sun size={12} />}
              </span>
            </button>

            <div ref={langRef} className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={[
                  "flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] px-3.5 py-2 border rounded-xl transition-all duration-200",
                  langOpen
                    ? "border-ink text-ink bg-paper"
                    : "border-line text-ink-soft hover:text-ink hover:border-ink",
                ].join(" ")}
              >
                {current.flag} {current.label}{" "}
                <motion.span
                  animate={{ rotate: langOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ display: "flex" }}
                >
                  <ArrowDown size={10} />
                </motion.span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
                    className="absolute top-full mt-1.5 inset-x-0 bg-paper border border-ink rounded-xl p-1.5 shadow-[0_12px_30px_-10px_rgba(28,39,71,0.18)] z-[60] flex flex-col gap-0.5 origin-top"
                  >
                    {LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code);
                          setLangOpen(false);
                        }}
                        className={[
                          "px-2 py-1.5 rounded-lg font-mono text-[11px] tracking-[0.12em] transition-all text-center",
                          l.code === lang
                            ? "text-ink bg-accent/20"
                            : "text-ink-soft hover:bg-ink/5 hover:text-ink",
                        ].join(" ")}
                      >
                        {l.flag} {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="#contacto"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink text-paper text-[13px] font-medium border border-ink transition-all hover:bg-accent hover:border-accent"
            >
              {t("nav.cta")} <Arrow size={12} />
            </a>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="menu"
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-line text-ink"
            >
              {menuOpen ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={[
          "md:hidden fixed inset-0 top-[70px] z-[49] bg-bg p-8 transition-[opacity,transform] duration-300",
          menuOpen
            ? "opacity-100 pointer-events-auto translate-y-0"
            : "opacity-0 pointer-events-none -translate-y-2.5",
        ].join(" ")}
      >
        <ul className="flex flex-col gap-6">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={closeMenu}
                className="font-serif text-[36px] tracking-tight text-ink min-h-11 inline-flex items-center"
              >
                {t(l.key)}
              </a>
            </li>
          ))}
          <li className="mt-7 pt-6 border-t border-line">
            <div className="flex gap-5">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code);
                    closeMenu();
                  }}
                  className={[
                    "font-mono text-[13px] tracking-[0.1em] inline-flex items-center gap-1.5",
                    l.code === lang ? "text-accent-deep" : "text-ink-soft hover:text-ink",
                  ].join(" ")}
                >
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
