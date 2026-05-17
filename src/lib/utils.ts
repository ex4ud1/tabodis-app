/**
 * Slugify a title to a URL-safe identifier (Spanish-aware).
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Extract Supabase storage paths from a list of public-URL strings produced by
 * `supa.storage.from(bucket).getPublicUrl(...)`. Used to remove the underlying
 * objects when their owning row is deleted.
 *
 * @example
 *   imageUrlsToStoragePaths(
 *     ["https://x.supabase.co/storage/v1/object/public/property-images/abc.jpg"],
 *     "property-images",
 *   ) // → ["abc.jpg"]
 */
export function imageUrlsToStoragePaths(urls: unknown, bucket: string): string[] {
  const list = Array.isArray(urls) ? urls : [];
  const marker = `/storage/v1/object/public/${bucket}/`;
  const paths: string[] = [];
  for (const u of list) {
    if (typeof u !== "string") continue;
    const idx = u.indexOf(marker);
    if (idx < 0) continue;
    const path = u.slice(idx + marker.length);
    if (path) paths.push(path);
  }
  return paths;
}

/**
 * Format a price as Spanish-locale euros.
 */
export function formatPrice(value: number, kind: "venta" | "alquiler" = "venta"): string {
  if (kind === "alquiler") {
    return `€${value.toLocaleString("es-ES")}/mes`;
  }
  if (value >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 2)}M`;
  }
  if (value >= 1_000) {
    return `€${(value / 1_000).toFixed(0)}k`;
  }
  return `€${value.toLocaleString("es-ES")}`;
}
