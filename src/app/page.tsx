import { createServerClient } from "@/lib/supabase/server";

// Always render at request-time so env-driven Supabase fetch is fresh
// and we never block builds on missing env vars.
export const dynamic = "force-dynamic";

type PropertyRow = {
  id: string;
  slug: string;
  title: string;
  city: string;
  price: number;
  type: string;
};

async function fetchProperties(): Promise<PropertyRow[] | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("properties")
      .select("id, slug, title, city, price, type")
      .eq("status", "live")
      .order("featured", { ascending: false })
      .limit(5);
    if (error) return null;
    return data as PropertyRow[];
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const properties = await fetchProperties();

  return (
    <main id="main" className="mx-auto max-w-5xl px-6 py-24">
      <div className="mb-16">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">
          Phase 1 · Foundation deployed
        </p>
        <h1 className="mt-4 font-serif text-6xl leading-none tracking-tight text-ink md:text-8xl">
          Tabo<em className="italic text-accent">·</em>dis
          <em className="italic text-accent">.</em>
        </h1>
        <p className="mt-6 max-w-prose text-lg text-ink-soft">
          Mini SaaS foundation is live. Next.js 15 + Supabase + Vercel — all on free tiers. Phase 2
          will port the full landing design from the reference HTML.
        </p>
      </div>

      <section className="rounded-2xl border border-line-soft bg-paper p-8">
        <h2 className="mb-6 font-serif text-3xl text-ink">Properties from Supabase</h2>
        {properties === null ? (
          <p className="text-ink-soft">
            Supabase connection not configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel project settings.
          </p>
        ) : properties.length > 0 ? (
          <ul className="divide-y divide-line-soft">
            {properties.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between py-3">
                <div>
                  <p className="font-medium text-ink">{p.title}</p>
                  <p className="font-mono text-xs uppercase tracking-wider text-ink-soft">
                    {p.city} · {p.type}
                  </p>
                </div>
                <p className="font-serif text-xl text-accent-deep">
                  €{Number(p.price).toLocaleString("es-ES")}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-soft">
            No properties yet — add them via Supabase Studio or Phase 3 admin panel.
          </p>
        )}
      </section>

      <footer className="mt-24 border-t border-line pt-8 font-mono text-xs uppercase tracking-widest text-ink-soft">
        Foundation · {new Date().getFullYear()}
      </footer>
    </main>
  );
}
