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

export const leadSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(120),
  email: z.string().email("Email inválido").max(160),
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

export const SERVICES_OPTIONS = SERVICES;
export const URGENCY_OPTIONS = URGENCY;
export const METHODS_OPTIONS = METHODS;
