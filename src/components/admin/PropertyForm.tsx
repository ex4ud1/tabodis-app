import { PhotoUploader } from "./PhotoUploader";

type Initial = {
  title?: string;
  description?: string | null;
  price?: number;
  type?: string;
  city?: string;
  loc?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  m2?: number | null;
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
  const Field = ({
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
    defaultValue?: string | number | undefined;
    required?: boolean;
    step?: string;
  }) => (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">{label}</span>
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

  return (
    <form action={action} className="flex flex-col gap-6 max-w-3xl">
      <Field name="title" label="Título *" defaultValue={i.title} required />

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">Descripción</span>
        <textarea
          name="description"
          rows={4}
          defaultValue={i.description ?? ""}
          className="border border-line rounded-xl p-3 text-base outline-none focus:border-accent transition-colors resize-y bg-transparent"
          style={{ fontSize: 16 }}
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field name="price" label="Precio (€) *" type="number" defaultValue={i.price} required />
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">Tipo *</span>
          <div className="relative">
            <select
              name="type"
              defaultValue={i.type ?? "venta"}
              className="w-full appearance-none rounded-xl border border-line bg-transparent px-3 py-2.5 text-base outline-none focus:border-accent transition-colors pr-9"
              style={{ fontSize: 16 }}
            >
              <option value="venta">Venta</option>
              <option value="alquiler">Alquiler</option>
              <option value="lujo">Lujo</option>
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">Estado</span>
          <div className="relative">
            <select
              name="status"
              defaultValue={i.status ?? "live"}
              className="w-full appearance-none rounded-xl border border-line bg-transparent px-3 py-2.5 text-base outline-none focus:border-accent transition-colors pr-9"
              style={{ fontSize: 16 }}
            >
              <option value="live">Publicada</option>
              <option value="draft">Borrador</option>
              <option value="review">En revisión</option>
              <option value="archived">Archivada</option>
            </select>
            <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">
          Fotos (la primera es la portada)
        </span>
        <PhotoUploader name="images" initial={i.images ?? []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field name="city" label="Ciudad *" defaultValue={i.city} required />
        <Field name="loc" label="Ubicación detallada" defaultValue={i.loc ?? ""} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field name="bedrooms" label="Habitaciones" type="number" defaultValue={i.bedrooms ?? 0} />
        <Field name="bathrooms" label="Baños" type="number" defaultValue={i.bathrooms ?? 0} />
        <Field name="m2" label="m²" type="number" defaultValue={i.m2 ?? 0} />
      </div>

      <label className="inline-flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={!!i.featured}
          className="w-4 h-4 accent-accent-deep"
        />
        <span className="text-sm text-ink">Destacada (aparece más grande)</span>
      </label>

      <div className="flex gap-3 items-center pt-4 border-t border-line">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
        {onDelete && (
          <form action={onDelete}>
            <button
              type="submit"
              className="text-danger text-[13px] underline underline-offset-4 hover:no-underline"
            >
              Eliminar
            </button>
          </form>
        )}
      </div>
    </form>
  );
}
