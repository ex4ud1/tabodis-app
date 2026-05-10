import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";
const OWNER_EMAIL = (process.env.OWNER_EMAIL ?? "tatanuk@gmail.com").toLowerCase();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(`${url.origin}/login`);
  }

  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    return NextResponse.redirect(`${url.origin}/login?error=${encodeURIComponent(error?.message ?? "auth")}`);
  }

  // Auto-provision owner on first sign-in (only if email matches OWNER_EMAIL).
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && data.user.email?.toLowerCase() === OWNER_EMAIL) {
    const admin = createAdminClient();
    await admin
      .from("workspace_members")
      .upsert(
        { workspace_id: WORKSPACE_ID, user_id: data.user.id, role: "owner" },
        { onConflict: "workspace_id,user_id", ignoreDuplicates: true },
      );
  }

  return NextResponse.redirect(`${url.origin}${next}`);
}
