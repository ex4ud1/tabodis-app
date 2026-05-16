import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify workspace membership — mirrors the check in admin/layout.tsx
  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("workspace_id", WORKSPACE_ID)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const [lNew, rPending] = await Promise.all([
    admin
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", WORKSPACE_ID)
      .eq("status", "new"),
    admin
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", WORKSPACE_ID)
      .eq("status", "pending"),
  ]);

  return NextResponse.json({
    leadsNew: lNew.count ?? 0,
    reviewsPending: rPending.count ?? 0,
  });
}
