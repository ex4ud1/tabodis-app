"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Counts = { leadsNew: number; reviewsPending: number };

type NavItem = {
  href: string;
  label: string;
  badgeKey: keyof Counts | null;
};

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", badgeKey: null },
  { href: "/admin/properties", label: "Propiedades", badgeKey: null },
  { href: "/admin/leads", label: "Leads", badgeKey: "leadsNew" },
  { href: "/admin/reviews", label: "Reseñas", badgeKey: "reviewsPending" },
];

export function AdminNav() {
  const [counts, setCounts] = useState<Counts>({ leadsNew: 0, reviewsPending: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/counts");
        if (res.ok) setCounts((await res.json()) as Counts);
      } catch {
        /* ignore */
      }
    };
    fetchCounts();
    const id = setInterval(fetchCounts, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav className="flex items-center gap-1 flex-wrap">
      {NAV.map((l) => {
        const badge = l.badgeKey ? counts[l.badgeKey] : 0;
        return (
          <Link
            key={l.href}
            href={l.href}
            className="relative px-3 py-1.5 rounded-full text-[13px] text-ink-soft hover:text-ink hover:bg-bg-2 transition-colors"
          >
            {l.label}
            {badge > 0 && (
              <span
                aria-label={`${badge} pendientes`}
                className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
