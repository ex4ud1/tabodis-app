import Link from "next/link";
import { createProperty } from "@/app/admin/actions";
import { PropertyForm } from "@/components/admin/PropertyForm";

export default function NewProperty() {
  return (
    <>
      <Link href="/admin/properties" className="text-[13px] text-ink-soft underline underline-offset-4 mb-4 inline-block">
        ← Volver a propiedades
      </Link>
      <h1 className="font-serif text-5xl tracking-tight text-ink mb-8">Nueva propiedad</h1>
      <PropertyForm action={createProperty} submitLabel="Crear" />
    </>
  );
}
