"use client";

import { useState } from "react";
import { PhotoUploader } from "./PhotoUploader";
import { DeletePropertyButton } from "./DeletePropertyButton";
import { CityCombobox } from "@/components/shared/CityCombobox";
import { SPAIN_CITIES } from "@/lib/spain-cities";
import { AddressCombobox } from "@/components/shared/AddressCombobox";
import { PropertyMap } from "@/components/shared/PropertyMap";
import {
  AMENITIES_OPTIONS,
  BUILDING_TYPES,
  BUILDING_TYPE_LABELS,
  ENERGY_CERTIFICATES,
  ENERGY_CERTIFICATE_LABELS,
  ORIENTATIONS,
  ORIENTATION_LABELS,
} from "@/lib/validations";

type Initial = {
  title?: string;
  description?: string | null;
  price?: number;
  type?: string;
  city?: string;
  loc?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  location_radius_m?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  m2?: number | null;
  building_type?: string | null;
  floor?: number | null;
  total_floors?: number | null;
  year_built?: number | null;
  orientation?: string | null;
  energy_certificate?: string | null;
  features?: string[];
  status?: string;
  featured?: boolean | null;
  images?: string[];
};

export function PropertyForm({
  action,
  initial,
  submitLabel,
  onDelete,
}: {
  action: (form: FormData) => Promise<void>;
  initial?: Initial;
  submitLabel: string;
  onDelete?: () => Promise<void>;
}) {
  const i = initial ?? {};

  const [city, setCity] = useState<string>(i.city ?? "");
  const [loc, setLoc] = useState<string>(i.loc ?? "");
  const [lat, setLat] = useState<number | null>(i.lat ?? null);
  const [lng, setLng] = useState<number | null>(i.lng ?? null);
  const [radius, setRadius] = useState<number>(i.location_radius_m ?? 300);
  const [features, setFeatures] = useState<string[]>(i.features ?? []);

  const toggleFeature = (f: string) => {
    setFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form action={action} className="flex flex-col gap-6">
        {/* ── Section 1 — Información básica ────────────────────────────── */}
        <Section title="Información básica">
          <Field name="title" label="Título *" defaultValue={i.title} required />

          <label className="flex flex-col gap-1.5">
            <FieldLabel>Descripción</FieldLabel>
            <textarea
              name="description"
              rows={4}
              defaultValue={i.description ?? ""}
              className="border border-line rounded-xl p-3 text-base outline-none focus:border-accent transition-colors resize-y bg-transparent"
              style={{ fontSize: 16 }}
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              name="type"
              label="Tipo *"
              defaultValue={i.type ?? "venta"}
              options={[
                { value: "venta", label: "Venta" },
                { value: "alquiler", label: "Alquiler" },
              ]}
            />
            <SelectField
              name="status"
              label="Estado"
              defaultValue={i.status ?? "live"}
              options={[
                { value: "live", label: "Publicada" },
                { value: "draft", label: "Borrador" },
                { value: "review", label: "En revisión" },
                { value: "archived", label: "Archivada" },
              ]}
            />
            <label className="inline-flex items-center gap-2 self-end pb-2">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={!!i.featured}
                className="w-4 h-4 accent-accent-deep"
              />
              <span className="text-sm text-ink">Destacada</span>
            </label>
          </div>
        </Section>

        {/* ── Section 2 — Precio y dimensiones ──────────────────────────── */}
        <Section title="Precio y dimensiones">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field name="price" label="Precio (€) *" type="number" defaultValue={i.price} required />
            <Field name="bedrooms" label="Habitaciones" type="number" defaultValue={i.bedrooms ?? 0} />
            <Field name="bathrooms" label="Baños" type="number" defaultValue={i.bathrooms ?? 0} />
            <Field name="m2" label="m²" type="number" defaultValue={i.m2 ?? 0} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SelectField
              name="building_type"
              label="Tipo de vivienda"
              defaultValue={i.building_type ?? ""}
              options={[
                { value: "", label: "—" },
                ...BUILDING_TYPES.map((b) => ({ value: b, label: BUILDING_TYPE_LABELS[b] })),
              ]}
            />
            <Field name="floor" label="Planta" type="number" defaultValue={i.floor ?? ""} />
            <Field name="total_floors" label="Total plantas" type="number" defaultValue={i.total_floors ?? ""} />
            <SelectField
              name="orientation"
              label="Orientación"
              defaultValue={i.orientation ?? ""}
              options={[
                { value: "", label: "—" },
                ...ORIENTATIONS.map((o) => ({ value: o, label: `${o} · ${ORIENTATION_LABELS[o]}` })),
              ]}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Field
              name="year_built"
              label="Año de construcción"
              type="number"
              defaultValue={i.year_built ?? ""}
            />
          </div>
        </Section>

        {/* ── Section 3 — Ubicación ─────────────────────────────────────── */}
        <Section title="Ubicación">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Ciudad *</FieldLabel>
              <CityCombobox
                value={city}
                onChange={setCity}
                onSelect={(s) => {
                  setLat(s.lat);
                  setLng(s.lng);
                }}
                name="city"
                latName="lat"
                lngName="lng"
                initialLat={lat}
                initialLng={lng}
                staticSource={SPAIN_CITIES}
                required
                placeholder="Empieza a escribir una ciudad…"
              />
            </div>
            <label className="flex flex-col gap-1.5">
              <FieldLabel>Zona / barrio</FieldLabel>
              <input
                name="loc"
                type="text"
                value={loc}
                onChange={(e) => setLoc(e.target.value)}
                className="border-0 border-b border-line bg-transparent py-2 text-base outline-none focus:border-accent transition-colors"
                style={{ fontSize: 16 }}
              />
            </label>
          </div>
          <AddressCombobox
            name="address"
            label="Dirección (opcional, no se muestra al público)"
            initialAddress={i.address ?? ""}
            onSelect={(s) => {
              if (s.city) setCity(s.city);
              // Photon often omits district for Spanish villages; fall back to
              // locality when it's a distinct sub-municipality (e.g. "La Olla"
              // inside Altea). If both are missing, leave loc for manual edit.
              const zona =
                s.district ??
                (s.locality && s.locality !== s.city ? s.locality : null);
              if (zona) setLoc(zona);
              setLat(s.lat);
              setLng(s.lng);
              // Reset to the Costa Blanca default privacy radius whenever a
              // new address is picked. Admin can still drag the slider after.
              setRadius(1500);
            }}
          />

          <div className="flex flex-col gap-2">
            <FieldLabel>Mapa (haz clic para fijar el punto exacto)</FieldLabel>
            <div className="rounded-2xl overflow-hidden border border-line h-72">
              <PropertyMap
                lat={lat}
                lng={lng}
                radiusM={radius}
                onPick={({ lat: la, lng: ln }) => {
                  setLat(la);
                  setLng(ln);
                }}
                className="w-full h-full"
              />
            </div>
            <p className="text-[11px] text-ink-soft">
              Coordenadas: {lat !== null && lng !== null ? `${lat.toFixed(5)}, ${lng.toFixed(5)}` : "—"}
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <div className="flex justify-between items-baseline">
              <FieldLabel>Radio de privacidad ({radius} m)</FieldLabel>
              <span className="text-[11px] text-ink-soft">
                El público solo verá un círculo de este tamaño
              </span>
            </div>
            <input
              type="range"
              name="location_radius_m"
              min={0}
              max={3000}
              step={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-accent-deep"
            />
          </label>
        </Section>

        {/* ── Section 4 — Comodidades ───────────────────────────────────── */}
        <Section title="Comodidades">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {AMENITIES_OPTIONS.map((opt) => {
              const on = features.includes(opt);
              return (
                <label
                  key={opt}
                  className={[
                    "flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] cursor-pointer transition-all",
                    on
                      ? "bg-ink text-paper border-ink"
                      : "border-line text-ink hover:border-ink",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    name="features"
                    value={opt}
                    checked={on}
                    onChange={() => toggleFeature(opt)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={[
                      "inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] leading-none",
                      on ? "bg-accent text-white" : "bg-line",
                    ].join(" ")}
                  >
                    {on ? "✓" : ""}
                  </span>
                  {opt}
                </label>
              );
            })}
          </div>
        </Section>

        {/* ── Section 5 — Certificado energético ────────────────────────── */}
        <Section title="Certificado energético">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              name="energy_certificate"
              label="Certificado"
              defaultValue={i.energy_certificate ?? ""}
              options={[
                { value: "", label: "—" },
                ...ENERGY_CERTIFICATES.map((c) => ({
                  value: c,
                  label: ENERGY_CERTIFICATE_LABELS[c],
                })),
              ]}
            />
          </div>
        </Section>

        {/* ── Section 6 — Fotos ─────────────────────────────────────────── */}
        <Section title="Fotos (la primera es la portada)">
          <PhotoUploader name="images" initial={i.images ?? []} />
        </Section>

        {/* ── Section 7 — Acciones ──────────────────────────────────────── */}
        <div className="flex gap-3 items-center pt-2">
          <button type="submit" className="btn-primary">
            {submitLabel}
          </button>
        </div>
      </form>

      {/* Delete is intentionally rendered outside the main <form>: HTML5
          forbids nested forms, and the previous implementation collapsed the
          inner delete form, so clicking "Eliminar" silently submitted the
          outer update form instead of deleting. */}
      {onDelete && (
        <div className="mt-4 flex justify-end">
          <DeletePropertyButton onDelete={onDelete} title={i.title ?? ""} />
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="bg-paper border border-line-soft rounded-2xl p-6 flex flex-col gap-5">
      <legend className="px-2 font-mono text-[10px] tracking-widest uppercase text-ink-soft">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">
      {children}
    </span>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required = false,
  step,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string | number | null | undefined;
  required?: boolean;
  step?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue ?? ""}
        step={step}
        className="border-0 border-b border-line bg-transparent py-2 text-base outline-none focus:border-accent transition-colors"
        style={{ fontSize: 16 }}
      />
    </label>
  );
}

function SelectField({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          name={name}
          defaultValue={defaultValue ?? ""}
          className="w-full appearance-none rounded-xl border border-line bg-transparent px-3 py-2.5 text-base outline-none focus:border-accent transition-colors pr-9"
          style={{ fontSize: 16 }}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M3 5l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </label>
  );
}
