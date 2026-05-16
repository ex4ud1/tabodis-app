import type { TranslateFn } from "@/lib/lang-dict";

export function Founder({ t }: { t: TranslateFn }) {
  return (
    <section className="section wrap py-24">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10 md:gap-20 items-start">
        <div className="aspect-[4/5] rounded-t-[240px] rounded-b-3xl overflow-hidden relative bg-bg-2">
          <div
            className="absolute inset-0 flex items-end justify-center pb-8"
            style={{
              backgroundImage:
                "repeating-linear-gradient(20deg, rgba(28,39,71,0.06) 0 2px, transparent 2px 16px)",
            }}
          >
            <span className="font-mono text-[10px] tracking-[0.14em] text-ink-soft bg-paper px-2.5 py-1.5 rounded">
              {t("founder.placeholder")}
            </span>
          </div>
        </div>
        <div className="pt-6">
          <span className="eyebrow text-accent-deep block mb-4">{t("founder.eyebrow")}</span>
          <h3 className="font-serif text-[clamp(56px,7vw,96px)] leading-[0.95] tracking-tight mb-9">
            Tatiana
            <br />
            <em className="italic text-accent-deep">Zinovii</em>.
          </h3>
          <p className="font-serif text-2xl leading-[1.4] text-ink max-w-[480px] mb-9">
            &ldquo;{t("founder.quote")}&rdquo;
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[480px] pt-7 border-t border-line">
            <div>
              <h5 className="font-mono text-[10px] tracking-[0.18em] text-accent-deep mb-2">
                {t("founder.mission_label")}
              </h5>
              <p className="text-[15px] text-ink leading-[1.4]">{t("founder.mission")}</p>
            </div>
            <div>
              <h5 className="font-mono text-[10px] tracking-[0.18em] text-accent-deep mb-2">
                {t("founder.vision_label")}
              </h5>
              <p className="text-[15px] text-ink leading-[1.4]">{t("founder.vision")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
