"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Arrow, HouseSearch, Pin } from "@/components/icons";
import { formatPrice } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { PropertyDetailModal } from "./PropertyDetailModal";

export type PropertyItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  city: string;
  loc: string;
  price: number;
  type: "venta" | "alquiler";
  bedrooms: number;
  bathrooms: number;
  m2: number;
  building_type: string | null;
  floor: number | null;
  total_floors: number | null;
  orientation: string | null;
  energy_certificate: string | null;
  features: string[];
  lat: number | null;
  lng: number | null;
  location_radius_m: number | null;
  featured: boolean;
  cover: string | null;
  images: string[];
};

type TabKey = "all" | "sale" | "rent";

const TAB_TYPE: Record<TabKey, PropertyItem["type"] | null> = {
  all: null,
  sale: "venta",
  rent: "alquiler",
};

const TAB_LABEL_KEY: Record<TabKey, string> = {
  all: "props.tab_all",
  sale: "props.tab_sale",
  rent: "props.tab_rent",
};

export function PropertiesClient({
  items,
  cities,
}: {
  items: PropertyItem[];
  cities: string[];
}) {
  const { t } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("all");
  const [cityFilter, setCityFilter] = useState<string[]>([]);

  const targetType = TAB_TYPE[tab];
  const filtered = items.filter(
    (p) =>
      (targetType === null || p.type === targetType) &&
      (cityFilter.length === 0 || cityFilter.includes(p.city)),
  );
  const isClean = tab === "all" && cityFilter.length === 0;
  const showFeatured = isClean;

  const toggleCity = (c: string) =>
    setCityFilter((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const clearAll = () => {
    setTab("all");
    setCityFilter([]);
  };
  const tabs: TabKey[] = ["all", "sale", "rent"];

  const openProperty = (slug: string) => {
    const sp = new URLSearchParams(window.location.search);
    sp.set("property", slug);
    router.replace(`${window.location.pathname}?${sp.toString()}`, { scroll: false });
  };

  return (
    <section className="section wrap py-24" id="propiedades">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-10 md:gap-16 items-end mb-12">
        <h2 className="font-serif text-[clamp(40px,6vw,88px)] leading-[0.95] tracking-tight text-ink">
          {t("props.title_l1")}
          <br />
          {t("props.title_l2_pre")} <em className="italic text-accent-deep">{t("props.title_em")}</em>
        </h2>
        <div>
          <p className="text-[17px] leading-[1.5] text-ink-soft max-w-[440px] mb-6">
            {t("props.desc")}
          </p>
          <div className="inline-flex gap-1 bg-paper p-1.5 rounded-full border border-line-soft">
            {tabs.map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={[
                  "px-5 py-2.5 rounded-full text-[13px] font-medium transition-all duration-200",
                  k === tab ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
                ].join(" ")}
              >
                {t(TAB_LABEL_KEY[k])}
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
            {filtered.length === 1 ? t("props.count_one") : t("props.count_many")}
          </span>
          {!isClean && (
            <button
              onClick={clearAll}
              className="text-ink-soft text-xs underline underline-offset-4 hover:text-accent-deep"
            >
              {t("props.clear")}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.length > 0 ? (
          filtered.map((p, i) => (
            <PropCard
              key={p.id}
              p={p}
              isFeatured={showFeatured && p.featured && i === 0}
              ariaLabelPrefix={t("props.aria_view")}
              tagSale={t("props.tag_sale")}
              tagRent={t("props.tag_rent")}
              statBed={t("props.bed")}
              statBath={t("props.bath")}
              statM2={t("props.m2")}
              onOpen={openProperty}
            />
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center text-center gap-4 py-16 px-6 bg-paper border border-dashed border-line rounded-3xl">
            <div className="w-16 h-16 rounded-full bg-accent/15 text-accent-deep flex items-center justify-center">
              <HouseSearch />
            </div>
            <h4 className="font-serif text-3xl text-ink">
              {t("props.empty_title_l1")}{" "}
              <em className="italic text-accent-deep">{t("props.empty_title_em")}</em>{" "}
              {t("props.empty_title_l2")}
            </h4>
            <p className="text-sm text-ink-soft max-w-[32ch] leading-[1.5]">
              {t("props.empty_desc")}
            </p>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              <a href="#contacto" className="btn-primary">
                {t("props.empty_cta")} <Arrow size={14} />
              </a>
              {!isClean && (
                <button onClick={clearAll} className="btn-ghost">
                  {t("props.empty_clear")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <PropertyDetailModal items={items} />
    </section>
  );
}

function PropCard({
  p,
  isFeatured,
  ariaLabelPrefix,
  tagSale,
  tagRent,
  statBed,
  statBath,
  statM2,
  onOpen,
}: {
  p: PropertyItem;
  isFeatured: boolean;
  ariaLabelPrefix: string;
  tagSale: string;
  tagRent: string;
  statBed: string;
  statBath: string;
  statM2: string;
  onOpen: (slug: string) => void;
}) {
  const tag = p.type === "alquiler" ? tagRent : tagSale;
  const isRent = p.type === "alquiler";

  return (
    <a
      href={`?property=${encodeURIComponent(p.slug)}`}
      onClick={(e) => {
        // Allow ctrl/cmd-click or middle-click for opening in a new tab.
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onOpen(p.slug);
      }}
      aria-label={`${ariaLabelPrefix} ${p.title}`}
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
        {p.cover ? (
          <Image
            src={p.cover}
            alt={p.title}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, var(--bg-2), color-mix(in oklab, var(--accent) 18%, var(--bg-2)))",
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(28,39,71,0.05) 0 2px, transparent 2px 18px)",
            }}
          />
        )}
        <span
          className={[
            "absolute top-4 left-4 px-3 py-1.5 rounded-full font-mono text-[10px] tracking-[0.14em] uppercase border",
            isRent
              ? "bg-paper text-ink border-line-soft"
              : "bg-accent text-white border-accent",
          ].join(" ")}
        >
          {tag}
        </span>
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
          <Stat label={statBed} value={p.bedrooms} />
          <Stat label={statBath} value={p.bathrooms} />
          <Stat label={statM2} value={p.m2} />
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
