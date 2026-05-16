import { z } from "zod";

const SERVICES = ["Inmobiliaria", "Extranjería", "Gestión", "Asesoría legal"] as const;
const URGENCY = [
  "Lo antes posible",
  "Próximos 3 meses",
  "Próximos 6 meses",
  "Solo explorando",
] as const;
const METHODS = ["Email", "Teléfono", "WhatsApp", "Telegram"] as const;
const LANG = ["es", "uk", "ru"] as const;

// Email may end up as the `replyTo` header — reject CRLF and angle brackets
// so a crafted address can't smuggle additional headers via Resend.
const safeEmail = z
  .string()
  .email("Email inválido")
  .max(160)
  .refine((e) => !/[\r\n<>]/.test(e), "Email inválido");

export const leadSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(120),
  email: safeEmail,
  phone: z.string().max(40).optional().or(z.literal("")),
  services: z.array(z.enum(SERVICES)).min(1, "Selecciona al menos un servicio"),
  budget: z.number().int().min(0).max(100_000).optional(),
  urgency: z.enum(URGENCY),
  contact_methods: z.array(z.enum(METHODS)).min(1),
  message: z.string().max(2000).optional().or(z.literal("")),
  language: z.enum(LANG).default("es"),
});

export type LeadInput = z.infer<typeof leadSchema>;

export const reviewSchema = z.object({
  author_name: z.string().min(1).max(120),
  city: z.string().max(80).optional().or(z.literal("")),
  rating: z.number().int().min(1).max(5),
  services: z.array(z.string()).max(5).default([]),
  body: z
    .string()
    .min(10, "Cuéntanos al menos 10 caracteres")
    .max(2000, "Reseña demasiado larga"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// Property images must live in our Supabase storage to prevent SSRF / pixel-leak via
// admin-injected external URLs. Fallback to a permissive https check when the project
// URL env var is missing (dev/test) so the schema still parses.
const SUPABASE_STORAGE_PREFIX = (() => {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base.replace(/\/$/, "")}/storage/v1/object/public/` : null;
})();

const propertyImageUrl = z
  .string()
  .url()
  .refine(
    (u) =>
      SUPABASE_STORAGE_PREFIX
        ? u.startsWith(SUPABASE_STORAGE_PREFIX)
        : u.startsWith("https://"),
    "La imagen debe estar alojada en el storage del proyecto",
  );

export const propertySchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  price: z.coerce.number().finite().nonnegative(),
  type: z.enum(["venta", "alquiler", "lujo"]),
  city: z.string().min(1, "La ciudad es obligatoria").max(80),
  loc: z.string().max(120).optional().or(z.literal("")),
  bedrooms: z.coerce.number().int().min(0).max(50).default(0),
  bathrooms: z.coerce.number().int().min(0).max(50).default(0),
  m2: z.coerce.number().int().min(0).max(100000).default(0),
  status: z.enum(["draft", "live", "review", "archived"]).default("live"),
  featured: z.coerce.boolean().default(false),
  images: z.array(propertyImageUrl).max(20).default([]),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const SERVICES_OPTIONS = SERVICES;
export const URGENCY_OPTIONS = URGENCY;
export const METHODS_OPTIONS = METHODS;
