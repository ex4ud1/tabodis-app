"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Arrow, ArrowLeft, Close, Pin } from "@/components/icons";
import { formatPrice } from "@/lib/utils";
import { useLang } from "@/lib/i18n";
import { buildBookingWhatsAppLink } from "@/lib/whatsapp";
import { PropertyMap } from "@/components/shared/PropertyMap";
import {
  BUILDING_TYPE_LABELS,
  ENERGY_CERTIFICATE_LABELS,
  ORIENTATION_LABELS,
  type BuildingType,
  type EnergyCertificate,
  type Orientation,
} from "@/lib/validations";
import type { PropertyItem } from "./PropertiesClient";

const QUERY_KEY = "property";

function asBuildingType(v: string | null | undefined): BuildingType | null {
  if (!v) return null;
  return v in BUILDING_TYPE_LABELS ? (v as BuildingType) : null;
}
function asOrientation(v: string | null | undefined): Orientation | null {
  if (!v) return null;
  return v in ORIENTATION_LABELS ? (v as Orientation) : null;
}
function asEnergy(v: string | null | undefined): EnergyCertificate | null {
  if (!v) return null;
  return v in ENERGY_CERTIFICATE_LABELS ? (v as EnergyCertificate) : null;
}

export function PropertyDetailModal({ items }: { items: PropertyItem[] }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get(QUERY_KEY);

  const item = useMemo(() => items.find((p) => p.slug === slug) ?? null, [items, slug]);
  const open = Boolean(item);

  const [photoIdx, setPhotoIdx] = useState(0);

  // Reset gallery when the open property changes.
  useEffect(() => {
    setPhotoIdx(0);
  }, [item?.id]);

  const close = useCallback(() => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete(QUERY_KEY);
    router.replace(`${window.location.pathname}${sp.size ? `?${sp.toString()}` : ""}`, {
      scroll: false,
    });
  }, [router, searchParams]);

  // Body scroll lock + ESC + arrow-key navigation.
  useEffect(() => {
    if (!open || !item) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" && item.images.length > 1) {
        setPhotoIdx((i) => (i + 1) % item.images.length);
      } else if (e.key === "ArrowLeft" && item.images.length > 1) {
        setPhotoIdx((i) => (i - 1 + item.images.length) % item.images.length);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, item, close]);

  if (!open || !item) return null;

  const building = asBuildingType(item.building_type);
  const orientation = asOrientation(item.orientation);
  const energy = asEnergy(item.energy_certificate);

  const whatsappHref = buildBookingWhatsAppLink({
    title: item.title,
    slug: item.slug,
    city: item.city,
    language: lang,
  });

  const photoCount = item.images.length;
  const currentPhoto = photoCount > 0 ? item.images[photoIdx] ?? item.images[0] : null;

  const facts: { label: string; value: string }[] = [];
  if (building) facts.push({ label: t("props.detail_building_type"), value: BUILDING_TYPE_LABELS[building] });
  if (item.floor != null)
    facts.push({
      label: t("props.detail_floor"),
      value:
        item.total_floors != null ? `${item.floor} / ${item.total_floors}` : String(item.floor),
    });
  if (orientation)
    facts.push({
      label: t("props.detail_orientation"),
      value: `${orientation} · ${ORIENTATION_LABELS[orientation]}`,
    });
  if (energy)
    facts.push({ label: t("props.detail_energy"), value: ENERGY_CERTIFICATE_LABELS[energy] });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-detail-title"
      onClick={close}
      className="fixed inset-0 z-[70] bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
      style={{ animation: "fade-in 0.25s ease" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-paper text-ink rounded-[24px] w-full max-w-[1080px] max-h-[92vh] shadow-[0_40px_120px_-40px_rgba(28,39,71,0.55)]"
        style={{ animation: "slide-up 0.35s cubic-bezier(0.2,0.8,0.2,1)" }}
      >
        <button
          onClick={close}
          aria-label={t("props.detail_close")}
          className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-paper/95 border border-line text-ink hover:bg-ink hover:text-paper transition-all inline-flex items-center justify-center shadow-[0_8px_24px_-8px_rgba(28,39,71,0.35)]"
        >
          <Close />
        </button>

        <div className="overflow-y-auto max-h-[92vh] rounded-[24px] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr]">
          {/* ── Photo gallery ─────────────────────────────────────────── */}
          <div className="bg-bg-2 relative">
            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[420px]">
              {currentPhoto ? (
                <Image
                  src={currentPhoto}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-ink-soft text-sm font-mono uppercase tracking-widest">
                  {t("props.detail_no_photos")}
                </div>
              )}

              {photoCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setPhotoIdx((i) => (i - 1 + photoCount) % photoCount)
                    }
                    aria-label={t("props.detail_gallery_prev")}
                    className="absolute top-1/2 left-3 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/90 border border-line text-ink hover:bg-ink hover:text-paper transition-all inline-flex items-center justify-center"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoIdx((i) => (i + 1) % photoCount)}
                    aria-label={t("props.detail_gallery_next")}
                    className="absolute top-1/2 right-3 -translate-y-1/2 w-10 h-10 rounded-full bg-paper/90 border border-line text-ink hover:bg-ink hover:text-paper transition-all inline-flex items-center justify-center"
                  >
                    <Arrow size={16} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-ink/70 text-paper text-[11px] font-mono">
                    {photoIdx + 1} / {photoCount}
                  </div>
                </>
              )}
            </div>

            {photoCount > 1 && (
              <div className="flex gap-1.5 overflow-x-auto px-3 py-3 bg-bg-2">
                {item.images.map((src, i) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setPhotoIdx(i)}
                    aria-current={i === photoIdx}
                    className={[
                      "relative w-20 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all",
                      i === photoIdx ? "border-accent" : "border-transparent opacity-70 hover:opacity-100",
                    ].join(" ")}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info panel ────────────────────────────────────────────── */}
          <div className="p-7 md:p-9 flex flex-col gap-5">
            <div>
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-ink-soft">
                <Pin /> {item.city}
                {item.loc && item.loc !== item.city ? ` · ${item.loc}` : ""}
              </span>
              <h2
                id="property-detail-title"
                className="font-serif text-[clamp(28px,3.5vw,42px)] leading-tight tracking-tight mt-2"
              >
                {item.title}
              </h2>
              <div className="font-serif text-3xl text-ink mt-2">
                {formatPrice(item.price, item.type)}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 py-4 border-y border-line-soft">
              <Stat label={t("props.bed")} value={item.bedrooms} />
              <Stat label={t("props.bath")} value={item.bathrooms} />
              <Stat label={t("props.m2")} value={item.m2} />
            </div>

            {facts.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {facts.map((f) => (
                  <div key={f.label} className="flex justify-between border-b border-line-soft py-1.5">
                    <dt className="text-ink-soft">{f.label}</dt>
                    <dd className="text-ink font-medium">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {item.description && (
              <div>
                <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mb-2">
                  {t("props.detail_description")}
                </div>
                <p className="text-sm text-ink leading-[1.6] whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>
            )}

            {item.features.length > 0 && (
              <div>
                <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mb-2">
                  {t("props.detail_amenities")}
                </div>
                <ul className="flex flex-wrap gap-1.5">
                  {item.features.map((f) => (
                    <li
                      key={f}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-line text-[12px] text-ink"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {item.lat != null && item.lng != null && (
              <div>
                <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mb-2">
                  {t("props.detail_location")}
                </div>
                <div className="rounded-2xl overflow-hidden border border-line h-48">
                  <PropertyMap
                    lat={item.lat}
                    lng={item.lng}
                    radiusM={item.location_radius_m ?? 300}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary self-start mt-2"
              >
                {t("props.book_visit")} <Arrow size={14} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5 font-mono text-[9px] tracking-widest uppercase text-ink-soft">
      <strong className="font-serif font-normal text-2xl text-ink leading-none tracking-tight">
        {value}
      </strong>
      {label}
    </div>
  );
}
