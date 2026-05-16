import type { TranslateFn } from "@/lib/lang-dict";

export function Principles({ t }: { t: TranslateFn }) {
  const items = [
    { num: "I", name: t("principles.p1_name"), text: t("principles.p1_text") },
    { num: "II", name: t("principles.p2_name"), text: t("principles.p2_text") },
    { num: "III", name: t("principles.p3_name"), text: t("principles.p3_text") },
  ];
  return (
    <section className="section wrap py-24" id="nosotros">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 items-end mb-16">
        <h2 className="font-serif text-[clamp(40px,6vw,88px)] leading-[0.95] tracking-tight text-ink">
          {t("principles.title_l1")}
          <br />
          <em className="italic text-accent-deep">{t("principles.title_em")}</em>
        </h2>
        <p className="text-[17px] leading-[1.5] text-ink-soft max-w-[440px]">
          {t("principles.desc")}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((p, i) => (
          <div
            key={p.num}
            className={[
              "rounded-3xl p-10 border border-line-soft relative overflow-hidden flex flex-col justify-between gap-8 min-h-[360px]",
              "transition-transform duration-[0.35s] hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(28,39,71,0.18)]",
              i === 1 ? "bg-ink text-paper" : i === 2 ? "bg-bg-2" : "bg-paper",
            ].join(" ")}
          >
            <div>
              <span
                className={`font-mono text-[11px] tracking-widest ${
                  i === 1 ? "text-accent" : "text-accent-deep"
                }`}
              >
                {t("principles.label")} {p.num}
              </span>
              <h3
                className={`font-serif text-[56px] leading-[0.95] tracking-tight mt-3 ${
                  i === 1 ? "text-paper" : "text-ink"
                }`}
              >
                <em className="italic">{p.name}</em>
              </h3>
            </div>
            <p
              className={`text-sm leading-[1.55] max-w-[32ch] ${
                i === 1 ? "text-paper/75" : "text-ink-soft"
              }`}
            >
              {p.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
