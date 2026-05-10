/**
 * JSON-LD structured data — RealEstateAgent + LocalBusiness + AggregateRating.
 * Server Component, rendered once in <head> via root layout / page.
 */
export function JsonLd({
  rating,
  reviewCount,
}: {
  rating?: number;
  reviewCount?: number;
}) {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tabodis-app.vercel.app";

  const data = {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    name: "Tabodis",
    description:
      "Asesoría privada en inmobiliaria, extranjería y gestión en la Costa Blanca, España.",
    url: SITE,
    image: `${SITE}/opengraph-image`,
    priceRange: "€€€",
    areaServed: [
      { "@type": "Place", name: "Costa Blanca" },
      { "@type": "City", name: "Alicante" },
      { "@type": "City", name: "Valencia" },
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "ES",
      addressLocality: "Alicante",
      addressRegion: "Comunidad Valenciana",
      streetAddress: "Av. de la Estación, 12",
    },
    foundingDate: "2019",
    founder: {
      "@type": "Person",
      name: "Tatiana Zinovii",
      jobTitle: "Fundadora",
    },
    knowsLanguage: ["es", "uk", "ru"],
    ...(typeof rating === "number" && reviewCount && reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.toFixed(1),
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
