import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type ActivityEvent = {
  kind: "property" | "lead" | "review";
  id: string;
  label: string;
  at: string;
  href: string;
};

async function loadDashboard() {
  const supabase = createAdminClient();
  const oneWeekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [pLive, pDraft, lNew, lWeek, lTotal, rPending, rApproved, lLatest, pLatest, rLatest] =
    await Promise.all([
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "live"),
      supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "draft"),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", oneWeekAgoIso),
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("reviews").select("rating").eq("status", "approved"),
      supabase
        .from("leads")
        .select("id, name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("properties")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("reviews")
        .select("id, author_name, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const ratings = (rApproved.data ?? []) as { rating: number }[];
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a, r) => a + (r.rating ?? 0), 0) / ratings.length
      : null;

  const events: ActivityEvent[] = [];
  for (const l of (lLatest.data ?? []) as { id: string; name: string; created_at: string | null }[]) {
    if (l.created_at)
      events.push({
        kind: "lead",
        id: l.id,
        label: `Nuevo lead: ${l.name}`,
        at: l.created_at,
        href: "/admin/leads",
      });
  }
  for (const p of (pLatest.data ?? []) as { id: string; title: string; created_at: string | null }[]) {
    if (p.created_at)
      events.push({
        kind: "property",
        id: p.id,
        label: `Propiedad: ${p.title}`,
        at: p.created_at,
        href: `/admin/properties/${p.id}`,
      });
  }
  for (const r of (rLatest.data ?? []) as { id: string; author_name: string; created_at: string | null }[]) {
    if (r.created_at)
      events.push({
        kind: "review",
        id: r.id,
        label: `Reseña de ${r.author_name}`,
        at: r.created_at,
        href: "/admin/reviews",
      });
  }
  events.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));

  return {
    propsLive: pLive.count ?? 0,
    propsDraft: pDraft.count ?? 0,
    leadsNew: lNew.count ?? 0,
    leadsThisWeek: lWeek.count ?? 0,
    leadsTotal: lTotal.count ?? 0,
    reviewsPending: rPending.count ?? 0,
    avgRating,
    reviewCount: ratings.length,
    activity: events.slice(0, 5),
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
function ActivityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function eventDot(kind: ActivityEvent["kind"]) {
  if (kind === "lead") return "bg-amber-500";
  if (kind === "property") return "bg-blue-500";
  return "bg-violet-500";
}

function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} d`;
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

export default async function Dashboard() {
  const c = await loadDashboard();

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1 — Propiedades */}
        <Link
          href="/admin/properties"
          className="group bg-paper border border-line-soft rounded-2xl p-5 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col gap-4 min-h-[210px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <BuildingIcon />
            </div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-ink-soft/60 group-hover:text-blue-500 transition-colors">
              Ver →
            </span>
          </div>
          <div className="mt-auto">
            <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mb-2">
              Propiedades
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-5xl text-ink leading-none">{c.propsLive}</span>
              <span className="text-xs text-ink-soft">publicadas</span>
            </div>
            <div className="text-[11px] text-ink-soft mt-2">
              {c.propsDraft > 0 ? (
                <span className="text-amber-600">{c.propsDraft} en borrador</span>
              ) : (
                "Sin borradores"
              )}
            </div>
          </div>
        </Link>

        {/* Tile 2 — Leads */}
        <Link
          href="/admin/leads"
          className="group bg-paper border border-line-soft rounded-2xl p-5 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col gap-4 min-h-[210px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UsersIcon />
            </div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-ink-soft/60 group-hover:text-amber-500 transition-colors">
              Ver →
            </span>
          </div>
          <div className="mt-auto">
            <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mb-2">
              Leads
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-5xl text-ink leading-none">{c.leadsThisWeek}</span>
              <span className="text-xs text-ink-soft">esta semana</span>
            </div>
            <div className="text-[11px] text-ink-soft mt-2">
              {c.leadsNew > 0 ? (
                <span className="text-amber-600">{c.leadsNew} sin contactar · </span>
              ) : null}
              {c.leadsTotal} en total
            </div>
          </div>
        </Link>

        {/* Tile 3 — Reseñas */}
        <Link
          href="/admin/reviews"
          className="group bg-paper border border-line-soft rounded-2xl p-5 hover:border-violet-400 hover:shadow-lg transition-all flex flex-col gap-4 min-h-[210px]"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <StarIcon />
            </div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-ink-soft/60 group-hover:text-violet-500 transition-colors">
              Ver →
            </span>
          </div>
          <div className="mt-auto">
            <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft mb-2">
              Reseñas
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-5xl text-ink leading-none">
                {c.avgRating ? c.avgRating.toFixed(1) : "—"}
              </span>
              <span className="text-xs text-ink-soft">★ promedio</span>
            </div>
            <div className="text-[11px] text-ink-soft mt-2">
              {c.reviewsPending > 0 ? (
                <span className="text-violet-600">{c.reviewsPending} pendientes · </span>
              ) : null}
              {c.reviewCount} aprobadas
            </div>
          </div>
        </Link>

        {/* Tile 4 — Actividad reciente */}
        <div className="bg-paper border border-line-soft rounded-2xl p-5 flex flex-col gap-3 min-h-[210px]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ActivityIcon />
            </div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-ink-soft/60">
              Últimos 5
            </span>
          </div>
          <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">
            Actividad reciente
          </div>
          {c.activity.length === 0 ? (
            <p className="text-xs text-ink-soft mt-2">Sin actividad reciente.</p>
          ) : (
            <ul className="flex flex-col gap-1.5 mt-0.5">
              {c.activity.map((e) => (
                <li key={`${e.kind}-${e.id}`}>
                  <Link
                    href={e.href}
                    className="group flex items-center gap-2 text-[12px] text-ink hover:text-accent-deep transition-colors"
                  >
                    <span
                      aria-hidden="true"
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${eventDot(e.kind)}`}
                    />
                    <span className="truncate flex-1">{e.label}</span>
                    <span className="text-[10px] text-ink-soft font-mono whitespace-nowrap">
                      {formatRelative(e.at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
