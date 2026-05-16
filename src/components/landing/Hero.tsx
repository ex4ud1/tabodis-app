import type { TranslateFn } from "@/lib/lang-dict";
import { HeroCTA } from "./HeroCTA";

export function Hero({ t }: { t: TranslateFn }) {
  return (
    <section className="hero wrap pt-20 pb-10 md:pt-24" id="inicio">
      <div className="hero-meta grid grid-cols-1 md:grid-cols-2 items-end gap-10 pb-8 border-b border-line">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">{t("hero.eyebrow_left")}</span>
        </div>
        <div className="flex flex-col gap-2 md:text-right">
          <span className="eyebrow">{t("hero.eyebrow_right")}</span>
        </div>
      </div>

      <h1 className="hero-display font-serif tracking-tighter text-ink mt-14 leading-[0.92] text-[clamp(48px,13vw,196px)]">
        {t("hero.h1_l1")}
        <br />
        <span className="inline-block pl-[8%] md:pl-[18%]">
          {t("hero.h1_l2_pre")} <em className="italic text-accent-deep">{t("hero.h1_l2_em")}</em>
        </span>
        <br />
        <span className="block text-right">{t("hero.h1_l3")}</span>
      </h1>

      <div className="hero-bottom mt-16 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-16 items-end">
        <p className="hero-lede text-[19px] leading-[1.45] text-ink-soft max-w-[460px]">
          {t("hero.lede_pre")}{" "}
          <em className="italic font-serif text-[1.15em] text-ink">{t("hero.lede_em")}</em>{" "}
          {t("hero.lede_post")}
        </p>
        <HeroCTA />
      </div>
    </section>
  );
}
