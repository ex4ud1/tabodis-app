import type { TranslateFn } from "@/lib/lang-dict";
import { Arrow } from "@/components/icons";

export function Services({ t }: { t: TranslateFn }) {
  const items = [
    { num: "01", title: t("services.s1_title"), desc: t("services.s1_desc"), href: "#propiedades" },
    { num: "02", title: t("services.s2_title"), desc: t("services.s2_desc"), href: "#proceso" },
    { num: "03", title: t("services.s3_title"), desc: t("services.s3_desc"), href: "#proceso" },
  ];
  return (
    <section className="section wrap py-24" id="servicios">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 items-end mb-16">
        <h2 className="font-serif text-[clamp(40px,6vw,88px)] leading-[0.95] tracking-tight text-ink">
          {t("services.title_l1")}
          <br />
          <em className="italic text-accent-deep">{t("services.title_em")}</em>
        </h2>
        <p className="text-[17px] leading-[1.5] text-ink-soft max-w-[440px]">
          {t("services.desc")}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((s) => (
          <article
            key={s.num}
            className="bg-paper rounded-3xl p-8 border border-line-soft flex flex-col relative overflow-hidden transition-all duration-[0.4s] hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(28,39,71,0.18)] group min-h-[320px]"
          >
            <span className="font-mono text-[11px] tracking-widest text-ink-mute mb-12">
              {s.num} / 03
            </span>
            <h3 className="font-serif text-4xl leading-none tracking-tight mb-4">{s.title}</h3>
            <p className="text-sm leading-[1.55] text-ink-soft mb-8 flex-1">{s.desc}</p>
            <a
              href={s.href}
              aria-label={`${t("services.aria_consult")} ${s.title}`}
              className="w-11 h-11 rounded-full bg-ink text-paper flex items-center justify-center self-start transition-all duration-300 group-hover:bg-accent group-hover:-rotate-45"
            >
              <Arrow />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
