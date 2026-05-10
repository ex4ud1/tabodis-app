import { HeroCTA } from "./HeroCTA";

export function Hero() {
  return (
    <section className="hero wrap pt-20 pb-10 md:pt-24" id="inicio">
      <div className="hero-meta grid grid-cols-1 md:grid-cols-2 items-end gap-10 pb-8 border-b border-line">
        <div className="flex flex-col gap-2">
          <span className="eyebrow">Est. 2019 — Alicante, ES</span>
        </div>
        <div className="flex flex-col gap-2 md:text-right">
          <span className="eyebrow">Asesoría privada · solo cita previa</span>
        </div>
      </div>

      <h1 className="hero-display font-serif tracking-tighter text-ink mt-14 leading-[0.92] text-[clamp(48px,13vw,196px)]">
        Bienes raíces
        <br />
        <span className="inline-block pl-[8%] md:pl-[18%]">
          y <em className="italic text-accent-deep">gestión</em>
        </span>
        <br />
        <span className="block text-right">integral.</span>
      </h1>

      <div className="hero-bottom mt-16 grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-16 items-end">
        <p className="hero-lede text-[19px] leading-[1.45] text-ink-soft max-w-[460px]">
          Una consultora privada que centraliza{" "}
          <em className="italic font-serif text-[1.15em] text-ink">todo</em> lo que necesitas para
          establecerte en España — desde encontrar y negociar tu casa ideal hasta resolver cada
          documento legal.
        </p>
        <HeroCTA />
      </div>
    </section>
  );
}
