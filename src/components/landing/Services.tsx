import { Arrow } from "@/components/icons";

const SERVICES = [
  {
    num: "01",
    title: "Inmobiliaria",
    desc: "No nos limitamos a enseñar propiedades; buscamos, filtramos y negociamos la vivienda ideal basándonos en tus intereses y presupuesto.",
    img: "Property exterior",
  },
  {
    num: "02",
    title: "Extranjería",
    desc: "Eliminamos las barreras burocráticas para garantizar una estancia legal y operativa en España desde el primer día.",
    img: "Documentation",
  },
  {
    num: "03",
    title: "Gestión",
    desc: "Actuamos como intérpretes y gestores para las necesidades cotidianas del hogar, la familia y los negocios.",
    img: "Daily operations",
  },
];

export function Services() {
  return (
    <section className="section wrap py-24" id="servicios">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 items-end mb-16">
        <h2 className="font-serif text-[clamp(40px,6vw,88px)] leading-[0.95] tracking-tight text-ink">
          Nuestros
          <br />
          <em className="italic text-accent-deep">servicios</em>
        </h2>
        <p className="text-[17px] leading-[1.5] text-ink-soft max-w-[440px]">
          Tres pilares que cubren cada momento de tu transición: encontrar, asentarte y vivir. Cada
          uno coordinado por la misma persona, sin intermediarios cambiantes.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SERVICES.map((s) => (
          <article
            key={s.num}
            className="bg-paper rounded-3xl p-7 border border-line-soft flex flex-col relative overflow-hidden transition-all duration-[0.4s] hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(28,39,71,0.18)] group"
          >
            <span className="font-mono text-[11px] tracking-widest text-ink-mute">
              {s.num} / 03
            </span>
            <div className="my-6 rounded-t-[200px] rounded-b-3xl aspect-[4/5] relative overflow-hidden bg-bg-2">
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(28,39,71,0.06) 0 2px, transparent 2px 14px)",
                }}
              >
                <span className="font-mono text-[10px] tracking-[0.16em] text-ink-soft bg-paper px-2.5 py-1.5 rounded">
                  {s.img}
                </span>
              </div>
            </div>
            <h3 className="font-serif text-4xl leading-none tracking-tight mb-3.5">{s.title}</h3>
            <p className="text-sm leading-[1.55] text-ink-soft mb-6 flex-1">{s.desc}</p>
            <a
              href="#contacto"
              aria-label={`Consultar sobre ${s.title}`}
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
