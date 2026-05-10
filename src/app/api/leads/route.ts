import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { leadSchema } from "@/lib/validations";
import { sendLeadEmail } from "@/lib/resend";
import type { Database } from "@/lib/supabase/types";

export const runtime = "nodejs";

const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
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

  // Use admin (service role) when available so workspace_id can be set even
  // without auth context. Fallback to anon (RLS allows anon insert if email/name valid).
  const useAdmin = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase: SupabaseClient<Database> = useAdmin
    ? createAdminClient()
    : ((await createServerClient()) as unknown as SupabaseClient<Database>);

  const { data: inserted, error } = await supabase
    .from("leads")
    .insert({
      workspace_id: useAdmin ? WORKSPACE_ID : null,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || null,
      services: lead.services as unknown as string[],
      budget: lead.budget ?? null,
      urgency: lead.urgency,
      contact_methods: lead.contact_methods as unknown as string[],
      message: lead.message || null,
      language: lead.language,
      source: "web",
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[api/leads] insert failed", error);
    return NextResponse.json({ error: "Could not save lead" }, { status: 500 });
  }

  // Fire-and-forget email; don't fail the request if email is down.
  try {
    await sendLeadEmail(lead);
  } catch (err) {
    console.error("[api/leads] email send threw", err);
  }

  return NextResponse.json({ ok: true, id: inserted?.id }, { status: 201 });
}
