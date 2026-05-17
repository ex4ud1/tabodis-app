// Build a deep-link to WhatsApp with a pre-filled message. Used by the
// "Reservar visita" CTA on the public listing modal.
//
// Reads NEXT_PUBLIC_WHATSAPP (must be the international format with or without
// + and spaces — non-digits are stripped). Returns null when the env var is
// missing so callers can hide the CTA gracefully.

export function buildBookingWhatsAppLink({
  title,
  slug,
  city,
  language = "es",
}: {
  title: string;
  slug: string;
  city?: string | null;
  language?: "es" | "uk" | "ru";
}): string | null {
  // Default to the agency's production WhatsApp number so the CTA works even
  // when the env var is missing (e.g. preview deploys without secrets).
  const raw = process.env.NEXT_PUBLIC_WHATSAPP ?? "+34624121047";
  const phone = raw.replace(/\D/g, "");
  if (!phone) return null;

  const where = city ? ` en ${city}` : "";
  const messages: Record<typeof language, string> = {
    es: `Hola, me gustaría reservar una visita para "${title}"${where} (ref: ${slug}). Gracias.`,
    uk: `Вітаю! Хочу записатися на перегляд "${title}"${where} (код: ${slug}). Дякую.`,
    ru: `Здравствуйте! Хочу записаться на просмотр "${title}"${where} (код: ${slug}). Спасибо.`,
  };
  const text = messages[language] ?? messages.es;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
