import { NextResponse } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

// Proxies the Photon geocoder (https://photon.komoot.io/api).
// - Free, no API key required, built specifically for typeahead.
// - Two modes: ?mode=city (default, backwards-compatible with CityCombobox)
//   and ?mode=address (returns full street/house/district details).
// - Spanish-first: language=es, biased toward Costa Blanca where most
//   listings live.
// - Rate-limits per client IP — Photon is a free public service, we should
//   not hammer it from a single deployment.

export const runtime = "nodejs";

const PHOTON_URL = "https://photon.komoot.io/api";
const USER_AGENT =
  process.env.PHOTON_USER_AGENT ??
  "TaboDis/1.0 (https://tabodis.com; contacto@tabodis.com)";

// Costa Blanca / Alicante — biases typeahead toward the region the agency
// actually operates in, so "Calp" finds the village rather than a random match.
const BIAS_LAT = "38.345";
const BIAS_LON = "-0.481";

const CITY_OSM_VALUES = new Set([
  "city",
  "town",
  "village",
  "municipality",
  "hamlet",
  "locality",
  "suburb",
]);

type Mode = "city" | "address";

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_id?: number;
    osm_key?: string;
    osm_value?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    locality?: string;
    suburb?: string;
    neighbourhood?: string;
    county?: string;
    state?: string;
    country?: string;
    countrycode?: string;
  };
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

type CitySuggestion = {
  id: number;
  label: string;
  city: string;
  region: string | null;
  country: string | null;
  lat: number;
  lng: number;
};

type AddressSuggestion = {
  id: number;
  label: string;
  street: string | null;
  housenumber: string | null;
  district: string | null;
  locality: string | null;
  city: string | null;
  postcode: string | null;
  region: string | null;
  country: string | null;
  lat: number;
  lng: number;
};

function parseMode(raw: string | null): Mode {
  return raw === "address" ? "address" : "city";
}

function featureCity(f: PhotonFeature): string | null {
  const p = f.properties;
  return p.city ?? p.locality ?? p.name ?? null;
}

function featureDistrict(f: PhotonFeature): string | null {
  const p = f.properties;
  return p.district ?? p.neighbourhood ?? p.suburb ?? null;
}

function buildAddressLabel(f: PhotonFeature): string {
  const p = f.properties;
  const head =
    p.street && p.housenumber
      ? `${p.street}, ${p.housenumber}`
      : p.street ?? p.name ?? "";
  const tail = [p.postcode, p.city ?? p.locality, p.state, p.country]
    .filter(Boolean)
    .join(", ");
  return [head, tail].filter(Boolean).join(" — ");
}

function buildCityLabel(f: PhotonFeature): string {
  const p = f.properties;
  return [p.name ?? p.city ?? p.locality, p.state, p.country].filter(Boolean).join(", ");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const mode = parseMode(url.searchParams.get("mode"));
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }
  // Length cap to keep URL/processing bounded. Photon accepts up to ~200 chars
  // and full Spanish addresses (street + number + postcode + locality) often
  // exceed 80, so we keep the cap generous for the address-typeahead flow.
  if (q.length > 200) {
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

  const upstream = new URL(PHOTON_URL);
  upstream.searchParams.set("q", q);
  upstream.searchParams.set("lang", "es");
  upstream.searchParams.set("limit", mode === "address" ? "8" : "6");
  upstream.searchParams.set("lat", BIAS_LAT);
  upstream.searchParams.set("lon", BIAS_LON);
  // City mode: restrict to populated places (osm_key=place). Address mode
  // intentionally leaves it open so streets/houses come through.
  if (mode === "city") upstream.searchParams.set("osm_tag", "place");

  try {
    const res = await fetch(upstream, {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept-Language": "es,en",
      },
      // Edge cache for 1 h; reduces hits on Photon and speeds the UX.
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Geocoder respondió ${res.status}` },
        { status: 502 },
      );
    }
    const data = (await res.json()) as PhotonResponse;
    const features = data.features ?? [];

    if (mode === "address") {
      const suggestions: AddressSuggestion[] = [];
      let i = 0;
      for (const f of features) {
        const p = f.properties;
        const [lng, lat] = f.geometry.coordinates;
        suggestions.push({
          id: p.osm_id ?? i++,
          label: buildAddressLabel(f),
          street: p.street ?? null,
          housenumber: p.housenumber ?? null,
          district: featureDistrict(f),
          // Expose locality raw (not consumed by featureCity) so the admin form
          // can use it as a "zona / barrio" fallback when district is null —
          // common for Costa Blanca village addresses.
          locality: p.locality ?? null,
          city: featureCity(f),
          postcode: p.postcode ?? null,
          region: p.state ?? p.county ?? null,
          country: p.country ?? null,
          lat,
          lng,
        });
        if (suggestions.length >= 8) break;
      }
      return NextResponse.json({ suggestions });
    }

    const seen = new Set<string>();
    const suggestions: CitySuggestion[] = [];
    let i = 0;
    for (const f of features) {
      const p = f.properties;
      // Photon's osm_tag=place still occasionally returns boundary-style
      // entries; trim by osm_value to keep populated places only.
      if (p.osm_value && !CITY_OSM_VALUES.has(p.osm_value)) continue;
      const city = featureCity(f);
      if (!city) continue;
      const key = `${city}|${p.state ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const [lng, lat] = f.geometry.coordinates;
      suggestions.push({
        id: p.osm_id ?? i++,
        label: buildCityLabel(f),
        city,
        region: p.state ?? p.county ?? null,
        country: p.country ?? null,
        lat,
        lng,
      });
      if (suggestions.length >= 6) break;
    }
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error("[/api/geocode] fetch failed", err);
    return NextResponse.json({ error: "No se pudo contactar al geocoder" }, { status: 502 });
  }
}
