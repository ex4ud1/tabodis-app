export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-ink text-paper pt-24 pb-10 mt-20 rounded-t-[40px]">
      <div className="wrap">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 pb-20 border-b border-paper/15">
          <div>
            <div className="font-serif text-[clamp(56px,9vw,144px)] leading-[0.85] tracking-[-0.04em]">
              Tabo<em className="italic text-accent">·</em>dis<em className="italic text-accent">.</em>
            </div>
            <p className="mt-6 text-paper/70 text-sm max-w-[420px] leading-[1.5]">
              Expertos en inmobiliaria, extranjería y gestión. Facilitamos tu vida en España desde
              2019.
            </p>
          </div>
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-paper/50 mb-5">
              Servicios
            </h5>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#servicios" className="text-paper text-sm hover:text-accent transition-colors">
                  Inmobiliaria
                </a>
              </li>
              <li>
                <a href="#servicios" className="text-paper text-sm hover:text-accent transition-colors">
                  Extranjería
                </a>
              </li>
              <li>
                <a href="#servicios" className="text-paper text-sm hover:text-accent transition-colors">
                  Gestión
                </a>
              </li>
              <li>
                <a href="#servicios" className="text-paper text-sm hover:text-accent transition-colors">
                  Asesoría legal
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-paper/50 mb-5">
              Compañía
            </h5>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#nosotros" className="text-paper text-sm hover:text-accent transition-colors">
                  Sobre nosotros
                </a>
              </li>
              <li>
                <a href="#nosotros" className="text-paper text-sm hover:text-accent transition-colors">
                  Equipo
                </a>
              </li>
              {/* TODO: cuando exista /casos */}
              <li>
                <a href="#" className="text-paper text-sm hover:text-accent transition-colors">
                  Casos
                </a>
              </li>
              <li>
                <a href="#" className="text-paper text-sm hover:text-accent transition-colors">
                  Prensa
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-mono text-[10px] tracking-[0.18em] uppercase text-paper/50 mb-5">
              Contacto
            </h5>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="mailto:hola@tabodis.com"
                  className="text-paper text-sm hover:text-accent transition-colors"
                >
                  hola@tabodis.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+34965000000"
                  className="text-paper text-sm hover:text-accent transition-colors"
                >
                  +34 965 000 000
                </a>
              </li>
              <li className="text-paper text-sm">
                Av. de la Estación, 12
                <br />
                Alicante, ES
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 pt-8">
          <p className="font-mono text-[11px] tracking-widest uppercase text-paper/50">
            © {year} Tabodispain S.L.
          </p>
          <p className="font-mono text-[11px] tracking-widest uppercase text-paper/50">
            Privacidad · Cookies · Aviso legal
          </p>
        </div>
      </div>
    </footer>
  );
}
