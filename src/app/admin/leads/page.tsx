import { createAdminClient } from "@/lib/supabase/admin";
import { setLeadStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const DB_STATUSES = ["new", "contacted", "qualified", "closed"] as const;

const FILTERS = ["all", ...DB_STATUSES] as const;
type Filter = (typeof FILTERS)[number];

const LABEL: Record<Filter, string> = {
  all: "Todas",
  new: "Nuevos",
  contacted: "Contactados",
  qualified: "Calificados",
  closed: "Cerrados",
};

function isFilter(v: string | undefined): v is Filter {
  return !!v && (FILTERS as readonly string[]).includes(v);
}

function fmtBudget(k: number | null) {
  if (k === null || k === undefined) return "—";
  return k >= 1000 ? `€${(k / 1000).toFixed(k % 1000 === 0 ? 0 : 1)}M` : `€${k}k`;
}

export default async function LeadsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter: Filter = isFilter(sp.status) ? sp.status : "all";
  const supabase = createAdminClient();
  type Row = {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    services: string[] | null;
    budget: number | null;
    urgency: string | null;
    contact_methods: string[] | null;
    message: string | null;
    status: string;
    created_at: string | null;
  };
  const baseQuery = supabase
    .from("leads")
    .select(
      "id, name, email, phone, services, budget, urgency, contact_methods, message, status, created_at",
    )
    .order("created_at", { ascending: false });
  const query = filter === "all" ? baseQuery : baseQuery.eq("status", filter);
  const { data } = (await query) as { data: Row[] | null };
  const rows = data ?? [];

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <h1 className="font-serif text-5xl tracking-tight text-ink">Leads</h1>
        <div className="flex gap-1 bg-paper border border-line-soft p-1 rounded-full flex-wrap">
          {FILTERS.map((s) => (
            <a
              key={s}
              href={`/admin/leads?status=${s}`}
              className={[
                "px-3.5 py-1.5 rounded-full text-[12px]",
                filter === s ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
              ].join(" ")}
            >
              {LABEL[s]}
            </a>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-ink-soft">No hay leads en este estado.</p>
      ) : (
        <div className="grid gap-4">
          {rows.map((l) => (
            <div key={l.id} className="bg-paper border border-line-soft rounded-2xl p-6">
              <div className="flex items-baseline justify-between flex-wrap gap-3 mb-3">
                <div>
                  <strong className="text-ink text-lg">{l.name}</strong>{" "}
                  <a href={`mailto:${l.email}`} className="text-accent-deep underline underline-offset-4">
                    {l.email}
                  </a>
                  {l.phone && (
                    <>
                      {" · "}
                      <a href={`tel:${l.phone}`} className="text-accent-deep underline underline-offset-4">
                        {l.phone}
                      </a>
                    </>
                  )}
                  {filter === "all" && (
                    <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest border border-line text-ink-soft">
                      {LABEL[l.status as Filter] ?? l.status}
                    </span>
                  )}
                </div>
                <span className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">
                  {l.created_at ? new Date(l.created_at).toLocaleString("es-ES") : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                <KV label="Servicios" value={l.services?.join(", ") || "—"} />
                <KV label="Presupuesto" value={fmtBudget(l.budget)} />
                <KV label="Urgencia" value={l.urgency || "—"} />
                <KV label="Prefiere" value={l.contact_methods?.join(", ") || "—"} />
              </div>
              {l.message && (
                <p className="text-ink-soft text-sm border-t border-line-soft pt-3 mt-2 whitespace-pre-wrap">
                  {l.message}
                </p>
              )}
              <div className="flex gap-2 mt-4 flex-wrap">
                {DB_STATUSES.filter((s) => s !== l.status).map((s) => (
                  <form
                    key={s}
                    action={async () => {
                      "use server";
                      await setLeadStatus(l.id, s);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-[12px] border border-line rounded-full px-3 py-1 text-ink-soft hover:border-ink hover:text-ink transition-colors"
                    >
                      → {LABEL[s as Filter]}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-widest uppercase text-ink-soft">{label}</div>
      <div className="text-ink mt-0.5">{value}</div>
    </div>
  );
}
