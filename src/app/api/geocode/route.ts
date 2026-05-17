import { NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

// Proxies OSM Nominatim city search.
// - Attaches the User-Agent that Nominatim's usage policy requires.
// - Restricts results to Spain (country=es) by default.
// - Caches responses for 1 hour to stay friendly to the free tier.
// - Rate-limits per client IP because Nominatim caps free use at ~1 req/sec.
//
// Why server-side: calling Nominatim from the browser leaks a generic UA and
// gives no way to throttle abusive clients. The browser also hits CORS issues
// for some Nominatim regional mirrors.

export const runtime = "nodejs";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ??
  "TaboDis/1.0 (https://tabodis.com; contacto@tabodis.com)";

type NominatimRow = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    province?: string;
    country?: string;
    country_code?: string;
  };
};

type Suggestion = {
  id: number;
  label: string;
  city: string;
  region: string | null;
  country: string | null;
  lat: number;
  lng: number;
};

function pickCityName(row: NominatimRow): string {
  const a = row.address ?? {};
  return a.city ?? a.town ?? a.village ?? a.municipality ?? row.display_name.split(",")[0].trim();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] satisfies Suggestion[] });
  }
  // Length cap to keep URL/processing bounded.
  if (q.length > 80) {
    return NextResponse.json({ error: "Consulta demasiado larga" }, { status: 400 });
  }

  const ip = clientIp(request);
  const gate = checkRateLimit(`geocode:${ip}`, { limit: 30, windowMs: 60_000 });
  if (!gate.ok) {
    return NextResponse.json(
      { error: "Demasiadas peticiones, prueba en unos segundos" },
      { status: 429, headers: { "Retry-After": String(gate.retryAfter) } },
    );
  }

  const country = (url.searchParams.get("country") ?? "es").slice(0, 2);

  const upstream = new URL(NOMINATIM_URL);
  upstream.searchParams.set("format", "jsonv2");
  upstream.searchParams.set("addressdetails", "1");
  upstream.searchParams.set("limit", "6");
  upstream.searchParams.set("countrycodes", country);
  upstream.searchParams.set("featuretype", "city");
  upstream.searchParams.set("q", q);

  try {
    const res = await fetch(upstream, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "es,en",
      },
      // Edge cache for 1 h; reduces hits on Nominatim and speeds the UX.
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Geocoder respondió ${res.status}` },
        { status: 502 },
      );
    }
    const rows = (await res.json()) as NominatimRow[];
    const seen = new Set<string>();
    const suggestions: Suggestion[] = [];
    for (const r of rows) {
      const cls = r.class ?? "";
      const typ = r.type ?? "";
      // Keep populated places only — drop "way", "tourism", etc. that pollute
      // typeahead with non-city matches.
      const isPlace =
        cls === "place" && ["city", "town", "village", "municipality", "hamlet"].includes(typ);
      const isAdmin = cls === "boundary" && typ === "administrative";
      if (!isPlace && !isAdmin) continue;

      const city = pickCityName(r);
      if (!city) continue;
      const key = `${city}|${r.address?.state ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const region = r.address?.state ?? r.address?.province ?? null;
      const country = r.address?.country ?? null;
      const label = [city, region, country].filter(Boolean).join(", ");

      suggestions.push({
        id: r.place_id,
        label,
        city,
        region,
        country,
        lat: Number(r.lat),
        lng: Number(r.lon),
      });
      if (suggestions.length >= 6) break;
    }
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[/api/geocode] fetch failed", err);
    return NextResponse.json({ error: "No se pudo contactar al geocoder" }, { status: 502 });
  }
}
