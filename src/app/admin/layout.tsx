import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/properties", label: "Propiedades" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/reviews", label: "Reseñas" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify workspace membership; non-members get a friendly screen.
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="max-w-md text-center">
          <h1 className="font-serif text-4xl text-ink mb-3">Sin acceso</h1>
          <p className="text-sm text-ink-soft mb-6">
            Tu cuenta <strong>{user.email}</strong> no está autorizada para gestionar Tabodis.
          </p>
          <form action={signOut}>
            <button className="btn-ghost" type="submit">
              Cerrar sesión
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-line-soft bg-paper sticky top-0 z-40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
          <Link
            href="/admin"
            className="font-serif text-2xl tracking-tight text-ink"
          >
            Tabo<em className="italic text-accent">·</em>dis <span className="font-mono text-[10px] tracking-widest uppercase text-ink-soft ml-2">admin</span>
          </Link>
          <nav className="flex items-center gap-1 flex-wrap">
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 rounded-full text-[13px] text-ink-soft hover:text-ink hover:bg-bg-2 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <form action={signOut} className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-widest uppercase text-ink-soft hidden sm:inline">
              {user.email}
            </span>
            <button type="submit" className="text-[12px] text-ink-soft underline underline-offset-4 hover:text-accent-deep">
              Salir
            </button>
          </form>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
