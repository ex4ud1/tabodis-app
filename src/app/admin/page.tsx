import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

async function counts() {
  const supabase = createAdminClient();
  const [pLive, pDraft, lNew, rPending, rApproved] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "live"),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "draft"),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reviews").select("rating").eq("status", "approved"),
  ]);
  const ratings = (rApproved.data ?? []) as { rating: number }[];
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, r) => a + (r.rating ?? 0), 0) / ratings.length
      : null;
  return {
    propsLive: pLive.count ?? 0,
    propsDraft: pDraft.count ?? 0,
    leadsNew: lNew.count ?? 0,
    reviewsPending: rPending.count ?? 0,
    avgRating,
    reviewCount: ratings.length,
  };
}

function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="4" strokeLinecap="round" />
      <line x1="6" y1="20" x2="6" y2="14" strokeLinecap="round" />
    </svg>
  );
}

export default async function Dashboard() {
  const c = await counts();

  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <div className="mb-10">
        <h1 className="font-serif text-5xl tracking-tight text-ink">
          Hola, <em className="italic text-accent-deep">Tatiana</em>.
        </h1>
        <p className="text-ink-soft text-sm mt-2 capitalize">{today}</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Propiedades */}
        <Link
          href="/admin/properties"
          className="group bg-paper border border-line-soft rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BuildingIcon />
            </div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-ink-soft/60 group-hover:text-blue-500 transition-colors">
              Ver →
            </span>
          </div>
          <div>
            <div className="font-serif text-5xl text-ink leading-none">{c.propsLive}</div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mt-1.5">
              Publicadas
            </div>
            {c.propsDraft > 0 && (
              <div className="text-[11px] text-amber-600 mt-1">
                {c.propsDraft} en borrador
              </div>
            )}
          </div>
        </Link>

        {/* Leads */}
        <Link
          href="/admin/leads"
          className="group bg-paper border border-line-soft rounded-2xl p-5 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UsersIcon />
            </div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-ink-soft/60 group-hover:text-amber-500 transition-colors">
              Ver →
            </span>
          </div>
          <div>
            <div className="font-serif text-5xl text-ink leading-none">{c.leadsNew}</div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mt-1.5">
              Leads nuevos
            </div>
            {c.leadsNew > 0 && (
              <div className="text-[11px] text-amber-600 mt-1">Requieren atención</div>
            )}
          </div>
        </Link>

        {/* Reseñas */}
        <Link
          href="/admin/reviews"
          className="group bg-paper border border-line-soft rounded-2xl p-5 hover:border-violet-400 hover:shadow-lg transition-all flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <StarIcon />
            </div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-ink-soft/60 group-hover:text-violet-500 transition-colors">
              Ver →
            </span>
          </div>
          <div>
            <div className="font-serif text-5xl text-ink leading-none">{c.reviewsPending}</div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mt-1.5">
              Reseñas pendientes
            </div>
            {c.reviewsPending > 0 && (
              <div className="text-[11px] text-violet-600 mt-1">Pendientes de moderar</div>
            )}
          </div>
        </Link>

        {/* Rating */}
        <Link
          href="/admin/reviews"
          className="group bg-paper border border-line-soft rounded-2xl p-5 hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col gap-4"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ChartIcon />
            </div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-ink-soft/60 group-hover:text-emerald-500 transition-colors">
              Ver →
            </span>
          </div>
          <div>
            <div className="font-serif text-5xl text-ink leading-none">
              {c.avgRating ? c.avgRating.toFixed(1) : "—"}
            </div>
            <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mt-1.5">
              Rating medio
            </div>
            {c.reviewCount > 0 && (
              <div className="text-[11px] text-ink-soft mt-1">{c.reviewCount} reseñas</div>
            )}
          </div>
        </Link>
      </div>

      {/* Section overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-paper border border-line-soft rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BuildingIcon />
            </div>
            <h2 className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">Propiedades</h2>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Publicadas</span>
              <span className="font-medium text-ink">{c.propsLive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Borradores</span>
              <span className="font-medium text-ink">{c.propsDraft}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Total</span>
              <span className="font-medium text-ink">{c.propsLive + c.propsDraft}</span>
            </div>
          </div>
          <Link
            href="/admin/properties/new"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-medium hover:bg-blue-700 transition-colors"
          >
            + Nueva propiedad
          </Link>
        </div>

        <div className="bg-paper border border-line-soft rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UsersIcon />
            </div>
            <h2 className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">Leads</h2>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Nuevos</span>
              <span className={`font-medium ${c.leadsNew > 0 ? "text-amber-600" : "text-ink"}`}>
                {c.leadsNew}
              </span>
            </div>
          </div>
          <Link
            href="/admin/leads"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-white text-[12px] font-medium hover:bg-amber-600 transition-colors"
          >
            Ver todos los leads
          </Link>
        </div>

        <div className="bg-paper border border-line-soft rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <StarIcon />
            </div>
            <h2 className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">Reseñas</h2>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-soft">Pendientes</span>
              <span className={`font-medium ${c.reviewsPending > 0 ? "text-violet-600" : "text-ink"}`}>
                {c.reviewsPending}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Rating medio</span>
              <span className="font-medium text-ink">
                {c.avgRating ? `${c.avgRating.toFixed(1)} ★` : "—"}
              </span>
            </div>
          </div>
          <Link
            href="/admin/reviews"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-700 transition-colors"
          >
            Moderar reseñas
          </Link>
        </div>
      </div>
    </>
  );
}
