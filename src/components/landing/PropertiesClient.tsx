"use client";

import { useState, useEffect } from "react";
import { Arrow, Heart, HouseSearch, Pin } from "@/components/icons";
import { formatPrice } from "@/lib/utils";

export type PropertyItem = {
  id: string;
  slug: string;
  title: string;
  city: string;
  loc: string;
  price: number;
  type: "venta" | "alquiler" | "lujo";
  bedrooms: number;
  bathrooms: number;
  m2: number;
  featured: boolean;
};

const TABS = ["Todo", "Venta", "Alquiler", "Lujo"] as const;
type Tab = (typeof TABS)[number];

const TAB_TYPE: Record<Tab, PropertyItem["type"] | null> = {
  Todo: null,
  Venta: "venta",
  Alquiler: "alquiler",
  Lujo: "lujo",
};

export function PropertiesClient({
  items,
  cities,
}: {
  items: PropertyItem[];
  cities: string[];
}) {
  const [tab, setTab] = useState<Tab>("Todo");
  const [cityFilter, setCityFilter] = useState<string[]>([]);

  const targetType = TAB_TYPE[tab];
  const filtered = items.filter(
    (p) =>
      (targetType === null || p.type === targetType) &&
      (cityFilter.length === 0 || cityFilter.includes(p.city)),
  );
  const isClean = tab === "Todo" && cityFilter.length === 0;
  const showFeatured = isClean;

  const toggleCity = (c: string) =>
    setCityFilter((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const clearAll = () => {
    setTab("Todo");
    setCityFilter([]);
  };

  return (
    <section className="section wrap py-24" id="propiedades">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 items-end mb-12">
        <h2 className="font-serif text-[clamp(40px,6vw,88px)] leading-[0.95] tracking-tight text-ink">
          Busca
          <br />
          tu <em className="italic text-accent-deep">futuro hogar</em>
        </h2>
        <div>
          <p className="text-[17px] leading-[1.5] text-ink-soft max-w-[440px] mb-6">
            Cada propiedad pasa por una verificación legal y técnica antes de listarse. Nada de
            sorpresas en escritura.
          </p>
          <div className="inline-flex gap-1 bg-paper p-1.5 rounded-full border border-line-soft">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "px-5 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200",
                  t === tab ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
                ].join(" ")}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {cities.length > 0 && (
        <div className="flex items-center flex-wrap gap-x-6 gap-y-4 mb-8 pt-2">
          <div className="flex flex-wrap gap-1.5 flex-1">
            {cities.map((c) => {
              const on = cityFilter.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggleCity(c)}
                  className={[
                    "px-3.5 py-1.5 rounded-full border text-[12px] transition-all duration-200",
                    on
                      ? "bg-accent text-white border-accent"
                      : "border-line text-ink-soft hover:text-ink hover:border-ink",
                  ].join(" ")}
                >
                  {c}
                </button>
              );
            })}
          </div>
          <span className="font-mono text-[11px] tracking-widest uppercase text-ink-soft whitespace-nowrap">
            <strong className="text-ink font-medium">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "propiedad" : "propiedades"}
          </span>
          {!isClean && (
            <button
              onClick={clearAll}
              className="text-ink-soft text-xs underline underline-offset-4 hover:text-accent-deep"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((p, i) => (
            <PropCard key={p.id} p={p} isFeatured={showFeatured && p.featured && i === 0} />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center text-center gap-4 py-16 px-6 bg-paper border border-dashed border-line rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-accent/15 text-accent-deep flex items-center justify-center">
              <HouseSearch />
            </div>
            <h4 className="font-serif text-3xl text-ink">
              Sin <em className="italic text-accent-deep">coincidencias</em> por ahora
            </h4>
            <p className="text-sm text-ink-soft max-w-[32ch] leading-[1.5]">
              Cuéntanos qué buscas y te avisamos en cuanto aparezca una propiedad que encaje.
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <a href="#contacto" className="btn-primary">
                Hablar con Tatiana <Arrow size={14} />
              </a>
              {!isClean && (
                <button onClick={clearAll} className="btn-ghost">
                  Ver todas
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function PropCard({ p, isFeatured }: { p: PropertyItem; isFeatured: boolean }) {
  const [fav, setFav] = useState(false);

  // SSR-safe localStorage read
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("tabodis_favs") || "[]") as string[];
      setFav(favs.includes(p.slug));
    } catch {
      /* ignore */
    }
  }, [p.slug]);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !fav;
    setFav(next);
    try {
      const favs = JSON.parse(localStorage.getItem("tabodis_favs") || "[]") as string[];
      const updated = next ? [...new Set([...favs, p.slug])] : favs.filter((x) => x !== p.slug);
      localStorage.setItem("tabodis_favs", JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  };

  const tag = p.type === "alquiler" ? "ALQUILER" : "EN VENTA";

  return (
    <a
      href={`#propiedades`}
      data-prop-id={p.slug}
      aria-label={`Ver ${p.title}`}
      className={[
        "group relative bg-paper rounded-3xl border border-line-soft overflow-hidden flex flex-col transition-all duration-[0.4s] hover:-translate-y-1 hover:shadow-[0_24px_60px_-28px_rgba(28,39,71,0.25)]",
        isFeatured ? "md:col-span-1 md:row-span-2" : "",
      ].join(" ")}
    >
      <div
        className={[
          "relative bg-bg-2",
          isFeatured ? "aspect-[3/4]" : "aspect-[4/3]",
        ].join(" ")}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--bg-2), color-mix(in oklab, var(--accent) 18%, var(--bg-2)))",
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(28,39,71,0.05) 0 2px, transparent 2px 18px)",
          }}
        />
        <span
          className={[
            "absolute top-4 left-4 px-3 py-1.5 rounded-full font-mono text-[10px] tracking-[0.14em] uppercase border",
            tag === "EN VENTA"
              ? "bg-accent text-white border-accent"
              : "bg-paper text-ink border-line-soft",
          ].join(" ")}
        >
          {tag}
        </span>
        <button
          onClick={toggleFav}
          aria-label={fav ? "Quitar de favoritos" : "Añadir a favoritos"}
          className={[
            "absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-all",
            fav ? "bg-accent text-white" : "bg-paper text-ink hover:bg-accent hover:text-white",
          ].join(" ")}
        >
          <Heart size={14} filled={fav} />
        </button>
      </div>
      <div className="p-5 pb-6 flex flex-col gap-2.5 flex-1">
        <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-ink-soft">
          <Pin /> {p.loc}
        </span>
        <h4 className="font-serif text-2xl leading-tight tracking-tight text-balance">{p.title}</h4>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-serif text-[26px] tracking-tight text-ink">
            {formatPrice(p.price, p.type)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5 pt-3.5 border-t border-line-soft mt-auto">
          <Stat label="Hab." value={p.bedrooms} />
          <Stat label="Baños" value={p.bathrooms} />
          <Stat label="m² útiles" value={p.m2} />
        </div>
      </div>
      <span
        aria-hidden="true"
        className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center opacity-0 translate-y-2 -rotate-12 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:rotate-0 pointer-events-none"
      >
        <Arrow size={14} />
      </span>
    </a>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex flex-col gap-0.5 font-mono text-[9px] tracking-widest uppercase text-ink-soft">
      <strong className="font-serif font-normal text-xl text-ink leading-none tracking-tight">
        {value}
      </strong>
      {label}
    </span>
  );
}
