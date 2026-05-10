"use client";

import { Arrow } from "@/components/icons";
import { useLang } from "@/lib/i18n";

export function HeroCTA() {
  const { t } = useLang();
  return (
    <div className="hero-cta-row flex flex-wrap items-center gap-3 md:justify-end">
      <a href="#propiedades" className="btn-primary">
        {t("hero.cta_primary")} <Arrow size={14} />
      </a>
      <a href="#contacto" className="btn-ghost">
        {t("hero.cta_secondary")}
      </a>
    </div>
  );
}
