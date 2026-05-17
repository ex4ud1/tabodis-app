"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

export type AddressSuggestion = {
  id: number;
  label: string;
  street: string | null;
  housenumber: string | null;
  district: string | null;
  city: string | null;
  postcode: string | null;
  region: string | null;
  country: string | null;
  lat: number;
  lng: number;
};

export type AddressComboboxProps = {
  /** Hidden input name so the parent form submits the typed address string. */
  name?: string;
  /** Label rendered above the input. */
  label?: string;
  /** Pre-fill the input when editing an existing property. */
  initialAddress?: string;
  /** Fires when the user picks a suggestion. Use to autofill city/loc/lat/lng. */
  onSelect?: (s: AddressSuggestion) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
};

function suggestionToText(s: AddressSuggestion): string {
  if (s.street && s.housenumber) return `${s.street}, ${s.housenumber}`;
  if (s.street) return s.street;
  return s.label;
}

export function AddressCombobox({
  name,
  label,
  initialAddress = "",
  onSelect,
  placeholder = "Empieza a escribir una dirección…",
  required,
  className,
  inputClassName,
  disabled,
}: AddressComboboxProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(initialAddress);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AddressSuggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track latest request so a slow response can't overwrite a newer one.
  const reqIdRef = useRef(0);

  const search = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }
    const id = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/geocode?mode=address&q=${encodeURIComponent(trimmed)}`,
        { headers: { Accept: "application/json" } },
      );
      const json = (await res.json()) as {
        suggestions?: AddressSuggestion[];
        error?: string;
      };
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
  }, []);

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

  const pick = (s: AddressSuggestion) => {
    setValue(suggestionToText(s));
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

  const inputEl = (
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
        setValue(e.target.value);
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
  );

  return (
    <div ref={containerRef} className={["relative flex flex-col gap-1.5", className ?? ""].join(" ")}>
      {label && (
        <label className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-soft">
          {label}
        </label>
      )}
      {inputEl}
      {name && <input type="hidden" name={name} value={value} />}

      {open && (loading || error || items.length > 0) && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 z-30 top-full mt-1 max-h-80 overflow-auto rounded-xl border border-line bg-paper shadow-[0_24px_60px_-30px_rgba(28,39,71,0.45)]"
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
            items.map((s, i) => {
              const head =
                s.street && s.housenumber
                  ? `${s.street}, ${s.housenumber}`
                  : s.street ?? s.label;
              const tail = [s.district, s.city, s.postcode]
                .filter(Boolean)
                .join(" · ");
              return (
                <button
                  key={`${s.id}-${i}`}
                  id={`${listboxId}-opt-${s.id}`}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseEnter={() => setActive(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(s);
                  }}
                  className={[
                    "block w-full text-left px-3 py-2 text-sm transition-colors",
                    i === active ? "bg-ink text-paper" : "text-ink hover:bg-bg-2",
                  ].join(" ")}
                >
                  <div className="font-medium">{head}</div>
                  {tail && (
                    <div className={i === active ? "text-paper/70 text-xs" : "text-ink-soft text-xs"}>
                      {tail}
                    </div>
                  )}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
}
