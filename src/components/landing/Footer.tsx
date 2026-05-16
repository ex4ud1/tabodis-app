"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n";

export function Footer() {
  const { t } = useLang();
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-paper pt-24 pb-10 mt-20 rounded-t-[40px]">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 pb-20 border-b border-paper/15">
          <div>
            <div className="font-serif text-[clamp(56px,9vw,144px)] leading-[0.85] tracking-[-0.04em]">
              Tabo<em className="italic text-accent">·</em>dis<em className="italic text-accent">.</em>
            </div>
            <p className="mt-6 text-paper/70 text-sm max-w-[420px] leading-[1.5]">
              {t("footer.tagline")}
            </p>
          </div>
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-paper/50 mb-5">
              {t("footer.servicios")}
            </h5>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#servicios" className="text-paper text-sm hover:text-accent transition-colors">
                  Inmobiliaria
                </a>
              </li>
              <li>
                <a href="#servicios" className="text-paper text-sm hover:text-accent transition-colors">
                  Extranjería
                </a>
              </li>
              <li>
                <a href="#servicios" className="text-paper text-sm hover:text-accent transition-colors">
                  Gestión
                </a>
              </li>
              <li>
                <a href="#servicios" className="text-paper text-sm hover:text-accent transition-colors">
                  Asesoría legal
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-paper/50 mb-5">
              {t("footer.compania")}
            </h5>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#nosotros" className="text-paper text-sm hover:text-accent transition-colors">
                  {t("footer.about")}
                </a>
              </li>
              <li>
                <a href="#nosotros" className="text-paper text-sm hover:text-accent transition-colors">
                  {t("footer.team")}
                </a>
              </li>
              {/* Casos / Prensa: enabled once the sections ship. */}
            </ul>
          </div>
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-paper/50 mb-5">
              {t("footer.contacto")}
            </h5>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="mailto:servicios@tabodis.com"
                  className="text-paper text-sm hover:text-accent transition-colors"
                >
                  servicios@tabodis.com
                </a>
              </li>
              <li className="text-paper text-sm">Alicante</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pt-8">
          <p className="font-mono text-[11px] tracking-widest uppercase text-paper/50">
            © {year} Tabodispain S.L.
          </p>
          <p className="font-mono text-[11px] tracking-widest uppercase text-paper/50">
            Privacidad · Cookies · Aviso legal
          </p>
          <Link
            href="/login"
            className="font-mono text-[10px] tracking-widest uppercase text-paper/20 hover:text-paper/50 transition-colors"
          >
            Acceso administración
          </Link>
        </div>
      </div>
    </footer>
  );
}
