import { createServerClient } from "@/lib/supabase/server";
import { moderateReview } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function ReviewsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filter = "pending" } = await searchParams;
  const supabase = await createServerClient();
  type Row = {
    id: string;
    author_name: string;
    city: string | null;
    rating: number;
    services: string[] | null;
    body: string;
    status: string;
    created_at: string | null;
  };
  const { data } = (await supabase
    .from("reviews")
    .select("id, author_name, city, rating, services, body, status, created_at")
    .eq("status", filter)
    .order("created_at", { ascending: false })) as { data: Row[] | null };
  const rows = data ?? [];

  return (
    <>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <h1 className="font-serif text-5xl tracking-tight text-ink">Reseñas</h1>
        <div className="flex gap-1 bg-paper border border-line-soft p-1 rounded-full">
          {(["pending", "approved", "rejected"] as const).map((s) => (
            <a
              key={s}
              href={`/admin/reviews?status=${s}`}
              className={[
                "px-4 py-1.5 rounded-full text-[12px]",
                filter === s ? "bg-ink text-paper" : "text-ink-soft hover:text-ink",
              ].join(" ")}
            >
              {s === "pending" ? "Pendientes" : s === "approved" ? "Aprobadas" : "Rechazadas"}
            </a>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-ink-soft">Nada por aquí.</p>
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <div key={r.id} className="bg-paper border border-line-soft rounded-2xl p-6">
              <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
                <div>
                  <strong className="text-ink">{r.author_name}</strong>
                  {r.city && <span className="text-ink-soft text-sm"> · {r.city}</span>}
                </div>
                <div className="text-accent">
                  {"★".repeat(r.rating)}
                  <span className="text-line">{"★".repeat(5 - r.rating)}</span>
                </div>
              </div>
              {r.services && r.services.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {r.services.map((s) => (
                    <span
                      key={s}
                      className="font-mono text-[10px] tracking-widest uppercase text-ink-soft border border-line rounded-full px-2 py-0.5"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-ink leading-relaxed mb-4">&ldquo;{r.body}&rdquo;</p>
              {filter === "pending" && (
                <div className="flex gap-2">
                  <form action={async () => {
                    "use server";
                    await moderateReview(r.id, "approve");
                  }}>
                    <button className="btn-primary" type="submit">
                      Aprobar
                    </button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await moderateReview(r.id, "reject");
                  }}>
                    <button className="btn-ghost" type="submit">
                      Rechazar
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
