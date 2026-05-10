import { createServerClient } from "@/lib/supabase/server";
import { PropertiesClient, type PropertyItem } from "./PropertiesClient";

const CITIES_BY_POPULARITY = [
  "Alicante",
  "Calpe",
  "Benidorm",
  "Altea",
  "Jávea",
  "Dénia",
  "Torrevieja",
  "Moraira",
  "Villajoyosa",
  "Valencia",
  "Madrid",
];

export const revalidate = 300;

async function fetchProperties(): Promise<PropertyItem[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return [];
  }
  try {
    const supabase = await createServerClient();
    type Row = {
      id: string;
      slug: string;
      title: string;
      city: string;
      loc: string;
      price: number;
      type: string;
      bedrooms: number | null;
      bathrooms: number | null;
      m2: number | null;
      featured: boolean | null;
      images: unknown;
    };
    const { data, error } = (await supabase
      .from("properties")
      .select("id, slug, title, city, loc, price, type, bedrooms, bathrooms, m2, featured, images")
      .eq("status", "live")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })) as { data: Row[] | null; error: unknown };
    if (error || !data) return [];
    return data.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      city: p.city,
      loc: p.loc,
      price: Number(p.price),
      type: p.type as "venta" | "alquiler" | "lujo",
      bedrooms: p.bedrooms ?? 0,
      bathrooms: p.bathrooms ?? 0,
      m2: p.m2 ?? 0,
      featured: !!p.featured,
      cover: Array.isArray(p.images) && typeof p.images[0] === "string" ? (p.images[0] as string) : null,
    }));
  } catch {
    return [];
  }
}

export async function Properties() {
  const items = await fetchProperties();
  const availableCities = CITIES_BY_POPULARITY.filter((c) => items.some((p) => p.city === c));
  return <PropertiesClient items={items} cities={availableCities} />;
}
