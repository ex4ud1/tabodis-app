const STEPS = [
  {
    n: "01",
    title: "Escuchamos",
    text: "Analizamos tu caso, tus objetivos y tu contexto para ofrecerte una solución adaptada a tus necesidades reales.",
  },
  {
    n: "02",
    title: "Preparamos",
    text: "Revisamos documentación, opciones y escenarios para evitar riesgos y anticiparnos a cualquier imprevisto.",
  },
  {
    n: "03",
    title: "Acompañamos",
    text: "Te asistimos en negociaciones, trámites y gestiones, coordinándonos con agencias, entidades y profesionales.",
  },
  {
    n: "04",
    title: "Cerramos",
    text: "Supervisamos todo el proceso hasta su finalización, asegurando que cada paso se complete con claridad.",
  },
];

export function Process() {
  return (
    <section className="section wrap py-24" id="proceso">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 items-end mb-16">
        <h2 className="font-serif text-[clamp(40px,6vw,88px)] leading-[0.95] tracking-tight text-ink">
          Cómo
          <br />
          <em className="italic text-accent-deep">trabajamos</em>
        </h2>
        <p className="text-[17px] leading-[1.5] text-ink-soft max-w-[440px]">
          Cuatro pasos. Una sola persona contigo en todos. Sin transferencias internas, sin perder
          el hilo de tu historia.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 border-t border-b border-line">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className={[
              "p-10 transition-colors duration-300 hover:bg-paper",
              i < STEPS.length - 1 ? "md:border-r border-b md:border-b-0 border-line" : "",
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
