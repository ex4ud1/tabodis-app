import type { TranslateFn } from "@/lib/lang-dict";

export function Process({ t }: { t: TranslateFn }) {
  const steps = [
    { n: "01", title: t("process.s1_title"), text: t("process.s1_text") },
    { n: "02", title: t("process.s2_title"), text: t("process.s2_text") },
    { n: "03", title: t("process.s3_title"), text: t("process.s3_text") },
    { n: "04", title: t("process.s4_title"), text: t("process.s4_text") },
  ];
  return (
    <section className="section wrap py-24" id="proceso">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 items-end mb-16">
        <h2 className="font-serif text-[clamp(40px,6vw,88px)] leading-[0.95] tracking-tight text-ink">
          {t("process.title_l1")}
          <br />
          <em className="italic text-accent-deep">{t("process.title_em")}</em>
        </h2>
        <p className="text-[17px] leading-[1.5] text-ink-soft max-w-[440px]">
          {t("process.desc")}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 border-t border-b border-line">
        {steps.map((s, i) => (
          <div
            key={s.n}
            className={[
              "p-10 transition-colors duration-300 hover:bg-paper",
              i < steps.length - 1 ? "md:border-r border-b md:border-b-0 border-line" : "",
            ].join(" ")}
          >
            <div className="font-serif text-[64px] md:text-[96px] leading-none text-accent-deep opacity-90 mb-4 md:mb-8">
              <em className="italic">{s.n}</em>
            </div>
            <h4 className="font-sans text-[13px] font-semibold tracking-wider uppercase mb-3.5 text-ink">
              {s.title}
            </h4>
            <p className="text-sm leading-[1.55] text-ink-soft">{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
