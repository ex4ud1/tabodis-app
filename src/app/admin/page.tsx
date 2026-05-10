import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function counts() {
  const supabase = await createServerClient();
  const [pLive, pDraft, lNew, rPending] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "live"),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return {
    propsLive: pLive.count ?? 0,
    propsDraft: pDraft.count ?? 0,
    leadsNew: lNew.count ?? 0,
    reviewsPending: rPending.count ?? 0,
  };
}

export default async function Dashboard() {
  const c = await counts();
  const tiles = [
    { label: "Propiedades publicadas", val: c.propsLive, href: "/admin/properties" },
    { label: "Borradores", val: c.propsDraft, href: "/admin/properties" },
    { label: "Leads nuevos", val: c.leadsNew, href: "/admin/leads" },
    { label: "Reseñas pendientes", val: c.reviewsPending, href: "/admin/reviews" },
  ];

  return (
    <>
      <h1 className="font-serif text-5xl tracking-tight text-ink mb-8">
        Hola, <em className="italic text-accent-deep">Tatiana</em>.
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="bg-paper border border-line-soft rounded-2xl p-5 hover:border-ink transition-colors"
          >
            <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">{t.label}</div>
            <div className="font-serif text-5xl text-ink mt-2 leading-none">{t.val}</div>
          </Link>
        ))}
      </div>
    </>
  );
}
