import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { deleteProperty, updateProperty } from "@/app/admin/actions";
import { PropertyForm } from "@/components/admin/PropertyForm";

export const dynamic = "force-dynamic";

export default async function EditProperty({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;
  const supabase = await createServerClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  const update = async (form: FormData) => {
    "use server";
    return updateProperty(id, form);
  };
  const remove = async () => {
    "use server";
    return deleteProperty(id);
  };

  const initial = {
    title: data.title as string,
    description: data.description as string | null,
    price: Number(data.price),
    type: data.type as string,
    city: data.city as string,
    loc: data.loc as string | null,
    bedrooms: data.bedrooms as number | null,
    bathrooms: data.bathrooms as number | null,
    m2: data.m2 as number | null,
    status: data.status as string,
    featured: data.featured as boolean | null,
  };

  return (
    <>
      <Link href="/admin/properties" className="text-[13px] text-ink-soft underline underline-offset-4 mb-4 inline-block">
        ← Volver a propiedades
      </Link>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <h1 className="font-serif text-5xl tracking-tight text-ink">{initial.title}</h1>
        {ok && <span className="text-positive text-sm">✓ Guardado</span>}
      </div>
      <PropertyForm action={update} initial={initial} submitLabel="Guardar" onDelete={remove} />
    </>
  );
}
