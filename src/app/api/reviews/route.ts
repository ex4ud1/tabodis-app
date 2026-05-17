import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validations";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { logSupabaseError } from "@/lib/logger";
import type { Database } from "@/lib/supabase/types";

export const runtime = "nodejs";

const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = checkRateLimit(`reviews:${ip}`, { limit: 3, windowMs: 60_000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const r = parsed.data;
  // See api/leads/route.ts for the cast rationale.
  // Anon SELECT on reviews is blocked by migration 0005, so we deliberately
  // skip .select().single() — the chained read returns 0 rows and falsely
  // surfaces a 500 even on a successful insert.
  const supabase = (await createServerClient()) as unknown as SupabaseClient<Database>;
  const { error } = await supabase
    .from("reviews")
    .insert({
      workspace_id: WORKSPACE_ID,
      author_name: r.author_name,
      city: r.city || null,
      rating: r.rating,
      services: r.services,
      body: r.body,
      status: "pending",
    });

  if (error) {
    logSupabaseError("api/reviews", error);
    return NextResponse.json({ error: "Could not save review" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
