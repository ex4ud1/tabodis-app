import "server-only";

/**
 * In-memory sliding-window rate limiter for public POST endpoints.
 *
 * This is best-effort defence against trivial spam. It only works inside a
 * single Node process — Vercel serverless runs many instances, so a determined
 * abuser still gets `instances × limit` requests/min. For production hardening
 * swap this for `@upstash/ratelimit` once an Upstash account is provisioned;
 * the public API of this module matches the typical Upstash wrapper to keep
 * the migration mechanical.
 */
type Bucket = { hits: number[] };
const buckets = new Map<string, Bucket>();

type Options = { limit: number; windowMs: number };

export function checkRateLimit(
  key: string,
  { limit, windowMs }: Options,
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const cutoff = now - windowMs;
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { hits: [] };
    buckets.set(key, bucket);
  }
  // Drop expired hits.
  bucket.hits = bucket.hits.filter((t) => t > cutoff);

  if (bucket.hits.length >= limit) {
    const oldest = bucket.hits[0] ?? now;
    return { ok: false, retryAfter: Math.ceil((oldest + windowMs - now) / 1000) };
  }

  bucket.hits.push(now);
  // Best-effort cleanup so the Map doesn't grow unbounded on Vercel cold
  // instances; running every ~200 calls keeps it cheap.
  if (buckets.size > 5_000 && Math.random() < 0.005) sweep(cutoff);
  return { ok: true, retryAfter: 0 };
}

function sweep(cutoff: number) {
  for (const [k, v] of buckets) {
    v.hits = v.hits.filter((t) => t > cutoff);
    if (v.hits.length === 0) buckets.delete(k);
  }
}

/**
 * Best-effort client IP extraction. Vercel sets `x-forwarded-for`; we trust the
 * left-most entry as the client because Vercel rewrites the chain at its edge.
 */
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}
