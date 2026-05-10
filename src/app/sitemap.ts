import type { MetadataRoute } from "next";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tabodis-app.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE}#propiedades`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}#servicios`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}#nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}#contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
