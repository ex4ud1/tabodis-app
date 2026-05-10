const PRINCIPLES = [
  {
    num: "I",
    name: "Curiosidad",
    text: "Investigamos cada detalle y analizamos todas las alternativas posibles. Buscamos siempre la mejor solución para cada cliente y cada situación.",
  },
  {
    num: "II",
    name: "Confianza",
    text: "Construimos relaciones sólidas y duraderas. Actuamos con honestidad y coherencia en cada paso del proceso.",
  },
  {
    num: "III",
    name: "Constancia",
    text: "Acompañamos hasta el cierre, sin desaparecer cuando llega la parte difícil. Cada caso, hasta el final.",
  },
];

export function Principles() {
  return (
    <section className="section wrap py-24" id="nosotros">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 items-end mb-16">
        <h2 className="font-serif text-[clamp(40px,6vw,88px)] leading-[0.95] tracking-tight text-ink">
          Por qué
          <br />
          <em className="italic text-accent-deep">elegirnos</em>
        </h2>
        <p className="text-[17px] leading-[1.5] text-ink-soft max-w-[440px]">
          Tres principios que sostienen cada decisión, cada llamada, cada firma. Y un cuarto, no
          escrito, que respetamos siempre.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRINCIPLES.map((p, i) => (
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
                PRINCIPIO {p.num}
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
