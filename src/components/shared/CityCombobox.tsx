"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

type Suggestion = {
  id: number;
  label: string;
  city: string;
  region: string | null;
  country: string | null;
  lat: number;
  lng: number;
};

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export type CityComboboxProps = {
  /** Controlled value: just the city name string. */
  value: string;
  /** Fires on every keystroke and when a suggestion is picked. */
  onChange: (city: string) => void;
  /**
   * Fires only when the user picks a suggestion. Use to capture lat/lng.
   * Skipping it means the parent only cares about the city name.
   */
  onSelect?: (s: Suggestion) => void;
  /** Hidden input name for non-controlled forms (FormData submit). */
  name?: string;
  /** Hidden input names for coordinates if you want them serialised. */
  latName?: string;
  lngName?: string;
  /** Pre-fill the hidden lat/lng inputs (e.g. when editing). */
  initialLat?: number | null;
  initialLng?: number | null;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  /** When provided, filters this list locally instead of calling the geocode API. */
  staticSource?: Suggestion[];
};

export function CityCombobox({
  value,
  onChange,
  onSelect,
  name,
  latName,
  lngName,
  initialLat,
  initialLng,
  placeholder = "Empieza a escribir una ciudad…",
  required,
  className,
  inputClassName,
  disabled,
  staticSource,
}: CityComboboxProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState<number | null>(initialLat ?? null);
  const [lng, setLng] = useState<number | null>(initialLng ?? null);

  // Track latest request so a slow response can't overwrite a newer one.
  const reqIdRef = useRef(0);

  const search = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (trimmed.length < 2) {
        setItems([]);
        setLoading(false);
        return;
      }

      if (staticSource) {
        const needle = normalize(trimmed);
        const filtered = staticSource
          .filter((s) => normalize(s.city).includes(needle) || normalize(s.label).includes(needle))
          .slice(0, 6);
        setItems(filtered);
        setActive(filtered.length > 0 ? 0 : -1);
        return;
      }

      const id = ++reqIdRef.current;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`, {
          headers: { Accept: "application/json" },
        });
        const json = (await res.json()) as { suggestions?: Suggestion[]; error?: string };
        if (id !== reqIdRef.current) return;
        if (!res.ok) {
          setError(json.error ?? "Error de geocodificación");
          setItems([]);
        } else {
          setItems(json.suggestions ?? []);
          setActive((json.suggestions ?? []).length > 0 ? 0 : -1);
        }
      } catch {
        if (id !== reqIdRef.current) return;
        setError("Sin conexión");
        setItems([]);
      } finally {
        if (id === reqIdRef.current) setLoading(false);
      }
    },
    [staticSource],
  );

  // Debounce typeahead by 300 ms.
  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => search(value), 300);
    return () => clearTimeout(handle);
  }, [value, open, search]);

  // Close on outside click.
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const pick = (s: Suggestion) => {
    onChange(s.city);
    setLat(s.lat);
    setLng(s.lng);
    onSelect?.(s);
    setOpen(false);
    setItems([]);
    setActive(-1);
    inputRef.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (items.length === 0 ? -1 : (i + 1) % items.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (items.length === 0 ? -1 : (i - 1 + items.length) % items.length));
    } else if (e.key === "Enter") {
      if (open && active >= 0 && items[active]) {
        e.preventDefault();
        pick(items[active]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={["relative", className ?? ""].join(" ")}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-activedescendant={
          active >= 0 && items[active] ? `${listboxId}-opt-${items[active].id}` : undefined
        }
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          // Typing invalidates a previously-picked coordinate.
          setLat(null);
          setLng(null);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete="off"
        className={
          inputClassName ??
          "w-full border-0 border-b border-line bg-transparent py-2 text-base outline-none focus:border-accent transition-colors"
        }
        style={{ fontSize: 16 }}
      />

      {/* Hidden inputs let the parent <form> submit values via FormData. */}
      {name && <input type="hidden" name={name} value={value} />}
      {latName && <input type="hidden" name={latName} value={lat ?? ""} />}
      {lngName && <input type="hidden" name={lngName} value={lng ?? ""} />}

      {open && (loading || error || items.length > 0) && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 max-h-72 overflow-auto rounded-xl border border-line bg-paper shadow-[0_24px_60px_-30px_rgba(28,39,71,0.45)]"
        >
          {loading && (
            <div className="px-3 py-2 text-xs text-ink-soft font-mono uppercase tracking-widest">
              Buscando…
            </div>
          )}
          {error && !loading && (
            <div className="px-3 py-2 text-xs text-danger font-mono uppercase tracking-widest">
              {error}
            </div>
          )}
          {!loading &&
            !error &&
            items.map((s, i) => (
              <button
                key={s.id}
                id={`${listboxId}-opt-${s.id}`}
                type="button"
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  // Prevent input blur before click handler runs.
                  e.preventDefault();
                  pick(s);
                }}
                className={[
                  "block w-full text-left px-3 py-2 text-sm transition-colors",
                  i === active ? "bg-ink text-paper" : "text-ink hover:bg-bg-2",
                ].join(" ")}
              >
                <div className="font-medium">{s.city}</div>
                {s.region && (
                  <div className={i === active ? "text-paper/70 text-xs" : "text-ink-soft text-xs"}>
                    {[s.region, s.country].filter(Boolean).join(", ")}
                  </div>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
