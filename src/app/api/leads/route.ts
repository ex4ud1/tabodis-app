import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/validations";
import { sendLeadEmail } from "@/lib/resend";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { logSupabaseError } from "@/lib/logger";
import type { Database } from "@/lib/supabase/types";

export const runtime = "nodejs";

const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = checkRateLimit(`leads:${ip}`, { limit: 5, windowMs: 60_000 });
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

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const lead = parsed.data;

  // Use the anon SSR client; RLS allows anonymous inserts that pass the
  // column constraints in migration 0004. workspace_id is always set to the
  // single-tenant workspace so the admin dashboard can see new leads.
  // The unknown-cast works around Supabase generated types collapsing to
  // `never[]` when the SSR wrapper is consumed outside of an admin context.
  // Anon clients can INSERT (RLS policy in migration 0004) but not SELECT
  // (migration 0005 restricts SELECT to authenticated). Chaining .select() here
  // returned 0 rows and .single() raised PGRST116, surfacing as a false 500
  // even when the row was actually inserted.
  const supabase = (await createServerClient()) as unknown as SupabaseClient<Database>;
  const { error } = await supabase
    .from("leads")
    .insert({
      workspace_id: WORKSPACE_ID,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || null,
      services: lead.services,
      budget: lead.budget ?? null,
      urgency: lead.urgency,
      contact_methods: lead.contact_methods,
      message: lead.message || null,
      language: lead.language,
      source: "web",
      status: "new",
    });

  if (error) {
    logSupabaseError("api/leads", error);
    return NextResponse.json({ error: "Could not save lead" }, { status: 500 });
  }

  // Fire-and-forget email; don't fail the request if email is down.
  try {
    await sendLeadEmail(lead);
  } catch (err) {
    logSupabaseError("api/leads:email", err);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
