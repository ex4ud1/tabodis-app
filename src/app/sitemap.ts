import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tabodis-app.vercel.app";

// Anchors on the landing page (#propiedades, etc.) are not indexed by Google as
// distinct documents, so listing them inflated the sitemap without SEO value.
// Detail pages per property will be added once the /properties/[slug] route ships.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: SITE, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
