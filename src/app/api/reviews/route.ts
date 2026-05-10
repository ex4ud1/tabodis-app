import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validations";

export const runtime = "nodejs";

const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
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
  const useAdmin = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = useAdmin ? createAdminClient() : await createServerClient();

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      workspace_id: useAdmin ? WORKSPACE_ID : null,
      author_name: r.author_name,
      city: r.city || null,
      rating: r.rating,
      services: r.services,
      body: r.body,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[api/reviews] insert failed", error);
    return NextResponse.json({ error: "Could not save review" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data?.id }, { status: 201 });
}
