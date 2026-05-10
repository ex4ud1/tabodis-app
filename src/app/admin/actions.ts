"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

async function getAuthedSupabase() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

function bumpAll() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/properties");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/leads");
}

// ─── Properties ────────────────────────────────────────────────────────────────

type PropPayload = {
  title: string;
  description?: string;
  price: number;
  type: "venta" | "alquiler" | "lujo";
  city: string;
  loc: string;
  bedrooms: number;
  bathrooms: number;
  m2: number;
  status: "draft" | "live" | "review" | "archived";
  featured: boolean;
};

function readPropForm(form: FormData): PropPayload {
  return {
    title: String(form.get("title") ?? "").trim(),
    description: String(form.get("description") ?? "").trim() || undefined,
    price: Number(form.get("price") ?? 0),
    type: (String(form.get("type") ?? "venta") as PropPayload["type"]),
    city: String(form.get("city") ?? "").trim(),
    loc: String(form.get("loc") ?? "").trim(),
    bedrooms: Number(form.get("bedrooms") ?? 0),
    bathrooms: Number(form.get("bathrooms") ?? 0),
    m2: Number(form.get("m2") ?? 0),
    status: (String(form.get("status") ?? "draft") as PropPayload["status"]),
    featured: form.get("featured") === "on",
  };
}

export async function createProperty(form: FormData) {
  const { supabase } = await getAuthedSupabase();
  const data = readPropForm(form);
  if (!data.title || !data.price || !data.city) {
    return { error: "Faltan título, precio o ciudad" };
  }
  const slug = slugify(data.title) + "-" + Date.now().toString(36).slice(-4);
  const { data: row, error } = await supabase
    .from("properties")
    .insert({
      workspace_id: WORKSPACE_ID,
      slug,
      title: data.title,
      description: data.description ?? null,
      price: data.price,
      type: data.type,
      city: data.city,
      loc: data.loc || data.city,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      m2: data.m2,
      status: data.status,
      featured: data.featured,
      published_at: data.status === "live" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  bumpAll();
  redirect(`/admin/properties/${row!.id}?ok=1`);
}

export async function updateProperty(id: string, form: FormData) {
  const { supabase } = await getAuthedSupabase();
  const data = readPropForm(form);
  const { error } = await supabase
    .from("properties")
    .update({
      title: data.title,
      description: data.description ?? null,
      price: data.price,
      type: data.type,
      city: data.city,
      loc: data.loc || data.city,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      m2: data.m2,
      status: data.status,
      featured: data.featured,
      published_at: data.status === "live" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  bumpAll();
  redirect(`/admin/properties/${id}?ok=1`);
}

export async function deleteProperty(id: string) {
  const { supabase } = await getAuthedSupabase();
  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) return { error: error.message };
  bumpAll();
  redirect("/admin/properties");
}

// ─── Reviews ───────────────────────────────────────────────────────────────────

export async function moderateReview(id: string, action: "approve" | "reject") {
  const { supabase } = await getAuthedSupabase();
  const { error } = await supabase
    .from("reviews")
    .update({ status: action === "approve" ? "approved" : "rejected" })
    .eq("id", id);
  if (error) return { error: error.message };
  bumpAll();
}

// ─── Leads ─────────────────────────────────────────────────────────────────────

export async function setLeadStatus(
  id: string,
  status: "new" | "contacted" | "qualified" | "closed",
) {
  const { supabase } = await getAuthedSupabase();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/leads");
}
