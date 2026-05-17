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
      description: string | null;
      city: string;
      loc: string;
      price: number;
      type: string;
      bedrooms: number | null;
      bathrooms: number | null;
      m2: number | null;
      building_type: string | null;
      floor: number | null;
      total_floors: number | null;
      year_built: number | null;
      orientation: string | null;
      energy_certificate: string | null;
      features: string[] | null;
      lat: number | null;
      lng: number | null;
      location_radius_m: number | null;
      featured: boolean | null;
      images: unknown;
    };
    const { data, error } = (await supabase
      .from("properties")
      .select(
        "id, slug, title, description, city, loc, price, type, bedrooms, bathrooms, m2, building_type, floor, total_floors, year_built, orientation, energy_certificate, features, lat, lng, location_radius_m, featured, images",
      )
      .eq("status", "live")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })) as { data: Row[] | null; error: unknown };
    if (error || !data) return [];
    return data.map((p) => {
      const images =
        Array.isArray(p.images) ? (p.images.filter((x) => typeof x === "string") as string[]) : [];
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        city: p.city,
        loc: p.loc,
        price: Number(p.price),
        type: p.type as "venta" | "alquiler",
        bedrooms: p.bedrooms ?? 0,
        bathrooms: p.bathrooms ?? 0,
        m2: p.m2 ?? 0,
        building_type: p.building_type,
        floor: p.floor,
        total_floors: p.total_floors,
        year_built: p.year_built,
        orientation: p.orientation,
        energy_certificate: p.energy_certificate,
        features: p.features ?? [],
        lat: p.lat,
        lng: p.lng,
        location_radius_m: p.location_radius_m,
        featured: !!p.featured,
        cover: images[0] ?? null,
        images,
      } satisfies PropertyItem;
    });
  } catch {
    return [];
  }
}

export async function Properties() {
  const items = await fetchProperties();
  const popularSet = new Set(CITIES_BY_POPULARITY);
  const presentCities = new Set(items.map((p) => p.city).filter((c): c is string => !!c));
  const popularInOrder = CITIES_BY_POPULARITY.filter((c) => presentCities.has(c));
  const extras = [...presentCities].filter((c) => !popularSet.has(c)).sort();
  const availableCities = [...popularInOrder, ...extras];
  return <PropertiesClient items={items} cities={availableCities} />;
}
