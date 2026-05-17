"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { imageUrlsToStoragePaths, slugify } from "@/lib/utils";
import { logSupabaseError } from "@/lib/logger";
import { propertySchema, type PropertyInput } from "@/lib/validations";

const PROPERTY_IMAGES_BUCKET = "property-images";

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
  // Check membership via admin (service role) so we never get tripped up by
  // policy/role nuances when a Server Action runs.
  const admin = createAdminClient();
  const { data: member } = await admin
    .from("workspace_members")
    .select("workspace_id, role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member) throw new Error("Unauthorized: not a workspace member");
  return { user, member, admin };
}

function bumpAll() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/properties");
  revalidatePath("/admin/reviews");
  revalidatePath("/admin/leads");
}

// ─── Properties ────────────────────────────────────────────────────────────────

function readPropForm(form: FormData): PropertyInput {
  let images: unknown = [];
  try {
    const raw = String(form.get("images") ?? "[]");
    images = JSON.parse(raw);
  } catch {
    images = [];
  }
  // Amenities arrive as repeated `features` checkbox values in FormData.
  const features = form.getAll("features").map((v) => String(v));
  const parsed = propertySchema.safeParse({
    title: String(form.get("title") ?? "").trim(),
    description: String(form.get("description") ?? "").trim(),
    price: form.get("price") ?? 0,
    type: String(form.get("type") ?? "venta"),
    city: String(form.get("city") ?? "").trim(),
    loc: String(form.get("loc") ?? "").trim(),
    address: String(form.get("address") ?? "").trim(),
    lat: form.get("lat"),
    lng: form.get("lng"),
    location_radius_m: form.get("location_radius_m"),
    bedrooms: form.get("bedrooms") ?? 0,
    bathrooms: form.get("bathrooms") ?? 0,
    m2: form.get("m2") ?? 0,
    building_type: form.get("building_type"),
    floor: form.get("floor"),
    total_floors: form.get("total_floors"),
    orientation: form.get("orientation"),
    energy_certificate: form.get("energy_certificate"),
    features,
    status: String(form.get("status") ?? "live"),
    featured: form.get("featured") === "on",
    images,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new Error(`Datos inválidos: ${first?.path.join(".") || "campo"} — ${first?.message}`);
  }
  return parsed.data;
}

export async function createProperty(form: FormData) {
  const { admin } = await requireMember();
  const data = readPropForm(form);
  const slug = slugify(data.title) + "-" + Date.now().toString(36).slice(-4);
  const { data: row, error } = await admin
    .from("properties")
    .insert({
      workspace_id: WORKSPACE_ID,
      slug,
      title: data.title,
      description: data.description || null,
      price: data.price,
      type: data.type,
      city: data.city,
      loc: data.loc || data.city,
      address: data.address || null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      location_radius_m: data.location_radius_m ?? null,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      m2: data.m2,
      building_type: data.building_type ?? null,
      floor: data.floor ?? null,
      total_floors: data.total_floors ?? null,
      orientation: data.orientation ?? null,
      energy_certificate: data.energy_certificate ?? null,
      features: data.features,
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
  redirect(`/admin/properties?ok=created`);
}

export async function updateProperty(id: string, form: FormData) {
  const { admin } = await requireMember();
  const data = readPropForm(form);
  const { error } = await admin
    .from("properties")
    .update({
      title: data.title,
      description: data.description || null,
      price: data.price,
      type: data.type,
      city: data.city,
      loc: data.loc || data.city,
      address: data.address || null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      location_radius_m: data.location_radius_m ?? null,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      m2: data.m2,
      building_type: data.building_type ?? null,
      floor: data.floor ?? null,
      total_floors: data.total_floors ?? null,
      orientation: data.orientation ?? null,
      energy_certificate: data.energy_certificate ?? null,
      features: data.features,
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
  redirect(`/admin/properties?ok=updated`);
}

export async function deleteProperty(id: string) {
  const { admin } = await requireMember();

  // Fetch the image list first so we know what to clean up from storage after
  // the row is gone. Done with a separate select rather than .delete().select()
  // because storage operations are fire-and-forget and must not block the
  // delete from succeeding.
  const { data: existing } = await admin
    .from("properties")
    .select("images")
    .eq("id", id)
    .maybeSingle();

  const { error } = await admin.from("properties").delete().eq("id", id);
  if (error) {
    logSupabaseError("deleteProperty", error);
    throw new Error(error.message);
  }

  if (existing) {
    const paths = imageUrlsToStoragePaths(
      (existing as { images: unknown }).images,
      PROPERTY_IMAGES_BUCKET,
    );
    if (paths.length > 0) {
      const { error: rmErr } = await admin.storage
        .from(PROPERTY_IMAGES_BUCKET)
        .remove(paths);
      if (rmErr) logSupabaseError("deleteProperty:storage", rmErr);
    }
  }

  bumpAll();
  redirect("/admin/properties?ok=deleted");
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
