import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  live: "Publicada",
  draft: "Borrador",
  review: "Revisión",
  archived: "Archivada",
};

export default async function PropertiesAdmin() {
  const supabase = await createServerClient();
  type Row = {
    id: string;
    title: string;
    city: string;
    price: number;
    type: string;
    status: string;
    featured: boolean | null;
    updated_at: string | null;
  };
  const { data } = (await supabase
    .from("properties")
    .select("id, title, city, price, type, status, featured, updated_at")
    .order("updated_at", { ascending: false })) as { data: Row[] | null };

  const rows = data ?? [];

  return (
    <>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="font-serif text-5xl tracking-tight text-ink">Propiedades</h1>
        <Link href="/admin/properties/new" className="btn-primary">
          + Nueva propiedad
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-ink-soft">Sin propiedades aún. Crea la primera.</p>
      ) : (
        <div className="bg-paper border border-line-soft rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-2 text-ink-soft font-mono text-[10px] tracking-widest uppercase">
                <th className="text-left p-4">Título</th>
                <th className="text-left p-4 hidden md:table-cell">Ciudad</th>
                <th className="text-left p-4 hidden md:table-cell">Tipo</th>
                <th className="text-left p-4">Precio</th>
                <th className="text-left p-4">Estado</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-line-soft">
                  <td className="p-4 text-ink font-medium">
                    {p.featured && <span className="text-accent mr-1.5">★</span>}
                    {p.title}
                  </td>
                  <td className="p-4 text-ink-soft hidden md:table-cell">{p.city}</td>
                  <td className="p-4 text-ink-soft hidden md:table-cell capitalize">{p.type}</td>
                  <td className="p-4 text-ink">{formatPrice(Number(p.price), p.type as "venta" | "alquiler" | "lujo")}</td>
                  <td className="p-4">
                    <span
                      className={[
                        "px-2 py-1 rounded-full font-mono text-[10px] tracking-widest uppercase border",
                        p.status === "live"
                          ? "bg-positive/10 text-positive border-positive/30"
                          : p.status === "draft"
                            ? "bg-bg-2 text-ink-soft border-line"
                            : p.status === "review"
                              ? "bg-warn/10 text-warn border-warn/30"
                              : "bg-line-soft text-ink-mute border-line",
                      ].join(" ")}
                    >
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/properties/${p.id}`}
                      className="text-accent-deep underline underline-offset-4 text-[13px]"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
