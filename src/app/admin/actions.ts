"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";

const WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Mutations use the service-role admin client to bypass RLS subtleties,
 * but we always verify the caller is an authenticated workspace member first.
 */
async function requireMember() {
  const supa = await createServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) throw new Error("Unauthorized: not signed in");
  const { data: member } = await supa
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member) throw new Error("Unauthorized: not a workspace member");
  return { user, member, admin: createAdminClient() };
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
  images: string[];
};

function readPropForm(form: FormData): PropPayload {
  let images: string[] = [];
  try {
    const raw = String(form.get("images") ?? "[]");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) images = parsed.filter((x) => typeof x === "string");
  } catch {
    /* ignore */
  }
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
    status: (String(form.get("status") ?? "live") as PropPayload["status"]),
    featured: form.get("featured") === "on",
    images,
  };
}

export async function createProperty(form: FormData) {
  const { admin } = await requireMember();
  const data = readPropForm(form);
  if (!data.title || !data.price || !data.city) {
    throw new Error("Faltan título, precio o ciudad");
  }
  const slug = slugify(data.title) + "-" + Date.now().toString(36).slice(-4);
  const { data: row, error } = await admin
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
      images: data.images,
      published_at: data.status === "live" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (error || !row) {
    console.error("[createProperty] insert failed", error);
    throw new Error(error?.message ?? "No se pudo crear la propiedad");
  }
  bumpAll();
  redirect(`/admin/properties/${row.id}?ok=1`);
}

export async function updateProperty(id: string, form: FormData) {
  const { admin } = await requireMember();
  const data = readPropForm(form);
  const { error } = await admin
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
      images: data.images,
      published_at: data.status === "live" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) {
    console.error("[updateProperty] failed", error);
    throw new Error(error.message);
  }
  bumpAll();
  redirect(`/admin/properties/${id}?ok=1`);
}

export async function deleteProperty(id: string) {
  const { admin } = await requireMember();
  const { error } = await admin.from("properties").delete().eq("id", id);
  if (error) {
    console.error("[deleteProperty] failed", error);
    throw new Error(error.message);
  }
  bumpAll();
  redirect("/admin/properties");
}

// ─── Reviews ───────────────────────────────────────────────────────────────────

export async function moderateReview(id: string, action: "approve" | "reject") {
  const { admin } = await requireMember();
  const { error } = await admin
    .from("reviews")
    .update({ status: action === "approve" ? "approved" : "rejected" })
    .eq("id", id);
  if (error) {
    console.error("[moderateReview] failed", error);
    throw new Error(error.message);
  }
  bumpAll();
}

// ─── Leads ─────────────────────────────────────────────────────────────────────

export async function setLeadStatus(
  id: string,
  status: "new" | "contacted" | "qualified" | "closed",
) {
  const { admin } = await requireMember();
  const { error } = await admin.from("leads").update({ status }).eq("id", id);
  if (error) {
    console.error("[setLeadStatus] failed", error);
    throw new Error(error.message);
  }
  revalidatePath("/admin/leads");
}
