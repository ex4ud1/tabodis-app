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
 * Format a price as Spanish-locale euros.
 */
export function formatPrice(value: number, kind: "venta" | "alquiler" | "lujo" = "venta"): string {
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
