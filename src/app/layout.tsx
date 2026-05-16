import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const manrope = Manrope({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// NEXT_PUBLIC_SITE_URL must be set in production — if it's missing here OG
// images and the canonical URL would silently fall back to the vercel.app
// preview domain. The fallback is kept only as a last resort for dev / CI.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tabodis-app.vercel.app";
if (
  process.env.NODE_ENV === "production" &&
  !process.env.NEXT_PUBLIC_SITE_URL
) {
  console.warn(
    "[layout] NEXT_PUBLIC_SITE_URL is not set in production — metadata is using the vercel.app fallback.",
  );
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tabodis — Bienes raíces y gestión integral",
    template: "%s · Tabodis",
  },
  description:
    "Asesoría privada en inmobiliaria, extranjería y gestión en la Costa Blanca. Te acompañamos hasta la firma.",
  applicationName: "Tabodis",
  authors: [{ name: "Tabodis" }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: "Tabodis",
    title: "Tabodis — Bienes raíces y gestión integral",
    description:
      "Asesoría privada en inmobiliaria, extranjería y gestión en la Costa Blanca.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tabodis — Bienes raíces y gestión integral",
    description:
      "Asesoría privada en inmobiliaria, extranjería y gestión en la Costa Blanca.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3ecdf" },
    { media: "(prefers-color-scheme: dark)", color: "#161e36" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      data-palette="cream"
      className={`${instrumentSerif.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:rounded-full"
        >
          Saltar al contenido
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
