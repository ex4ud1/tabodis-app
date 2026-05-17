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

// ─── Property domain constants ───────────────────────────────────────────────
export const PROPERTY_TYPES = ["venta", "alquiler"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const BUILDING_TYPES = [
  "apartamento",
  "casa",
  "villa",
  "atico",
  "adosado",
  "estudio",
  "duplex",
  "parte_casa",
] as const;
export type BuildingType = (typeof BUILDING_TYPES)[number];

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  apartamento: "Apartamento",
  casa: "Casa",
  villa: "Villa",
  atico: "Ático",
  adosado: "Adosado",
  estudio: "Estudio",
  duplex: "Dúplex",
  parte_casa: "Parte de casa",
};

export const ORIENTATIONS = ["N", "S", "E", "O", "NE", "NO", "SE", "SO"] as const;
export type Orientation = (typeof ORIENTATIONS)[number];

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  N: "Norte",
  S: "Sur",
  E: "Este",
  O: "Oeste",
  NE: "Noreste",
  NO: "Noroeste",
  SE: "Sureste",
  SO: "Suroeste",
};

export const ENERGY_CERTIFICATES = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "en_tramite",
  "exento",
] as const;
export type EnergyCertificate = (typeof ENERGY_CERTIFICATES)[number];

export const ENERGY_CERTIFICATE_LABELS: Record<EnergyCertificate, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  en_tramite: "En trámite",
  exento: "Exento",
};

// Curated amenity list (canonical values stored in DB column `features text[]`).
// Keep labels human-readable; the value === label here to avoid a separate map.
export const AMENITIES_OPTIONS = [
  "Piscina",
  "Garaje",
  "Terraza",
  "Balcón",
  "Jardín",
  "Vistas al mar",
  "Aire acondicionado",
  "Calefacción",
  "Ascensor",
  "Seguridad/Conserje",
  "Trastero",
  "Lavandería",
  "Lavavajillas",
  "Amueblado",
  "Patio",
  "Barbacoa",
  "Gimnasio",
  "Jacuzzi",
  "Placas solares",
  "Mascotas permitidas",
] as const;

// Optional helper: coerce a possibly-empty string into undefined so enum
// validation accepts "no value selected" without forcing the form to send null.
const optEnum = <T extends readonly [string, ...string[]]>(values: T) =>
  z
    .preprocess(
      (v) => (v === "" || v === null || v === undefined ? undefined : v),
      z.enum(values).optional(),
    );

const optInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(min).max(max).optional(),
  );

const optNumber = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().finite().min(min).max(max).optional(),
  );

export const propertySchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
  price: z.coerce.number().finite().nonnegative(),
  type: z.enum(PROPERTY_TYPES),
  city: z.string().min(1, "La ciudad es obligatoria").max(80),
  loc: z.string().max(120).optional().or(z.literal("")),
  address: z.string().max(240).optional().or(z.literal("")),
  lat: optNumber(-90, 90),
  lng: optNumber(-180, 180),
  location_radius_m: optInt(0, 50_000),
  bedrooms: z.coerce.number().int().min(0).max(50).default(0),
  bathrooms: z.coerce.number().int().min(0).max(50).default(0),
  m2: z.coerce.number().int().min(0).max(100000).default(0),
  building_type: optEnum(BUILDING_TYPES),
  floor: optInt(-5, 200),
  total_floors: optInt(1, 200),
  orientation: optEnum(ORIENTATIONS),
  energy_certificate: optEnum(ENERGY_CERTIFICATES),
  features: z.array(z.enum(AMENITIES_OPTIONS)).max(30).default([]),
  status: z.enum(["draft", "live", "review", "archived"]).default("live"),
  featured: z.coerce.boolean().default(false),
  images: z.array(propertyImageUrl).max(20).default([]),
});

export type PropertyInput = z.infer<typeof propertySchema>;

export const SERVICES_OPTIONS = SERVICES;
export const URGENCY_OPTIONS = URGENCY;
export const METHODS_OPTIONS = METHODS;
