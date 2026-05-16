import { LangProvider } from "@/lib/i18n";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { Properties } from "@/components/landing/Properties";
import { Principles } from "@/components/landing/Principles";
import { Process } from "@/components/landing/Process";
import { Founder } from "@/components/landing/Founder";
import { Testimonials } from "@/components/landing/Testimonials";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { ChatFab } from "@/components/shared/ChatFab";
import { ScrollProgressAndBackTop } from "@/components/shared/ScrollProgressAndBackTop";
import { Reveal } from "@/components/shared/Reveal";
import { CookieBanner } from "@/components/shared/CookieBanner";
import { JsonLd } from "@/components/shared/JsonLd";
import { createServerClient } from "@/lib/supabase/server";
import { getServerLang, getServerT } from "@/lib/lang-server";

// Cookie-driven i18n means each locale needs its own SSR payload. force-dynamic
// is the right trade-off here: the landing already issues two Supabase reads,
// which dominate the per-request budget anyway, and we lose nothing by skipping
// the static cache.
export const dynamic = "force-dynamic";

async function fetchAggregateRating() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { rating: undefined, reviewCount: 0 };
  }
  try {
    const supabase = await createServerClient();
    const { data } = (await supabase
      .from("reviews")
      .select("rating")
      .eq("status", "approved")) as { data: { rating: number }[] | null };
    if (!data || data.length === 0) return { rating: undefined, reviewCount: 0 };
    const total = data.reduce((acc, r) => acc + (r.rating ?? 0), 0);
    return { rating: total / data.length, reviewCount: data.length };
  } catch {
    return { rating: undefined, reviewCount: 0 };
  }
}

export default async function HomePage() {
  const [{ rating, reviewCount }, lang] = await Promise.all([
    fetchAggregateRating(),
    getServerLang(),
  ]);
  const t = getServerT(lang);
  return (
    <LangProvider initialLang={lang}>
      <JsonLd rating={rating} reviewCount={reviewCount} />
      <Nav />
      <main id="main">
        <Hero t={t} />
        <Services t={t} />
        <Properties />
        <Principles t={t} />
        <Process t={t} />
        <Founder t={t} />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <ChatFab whatsapp={process.env.NEXT_PUBLIC_WHATSAPP} />
      <ScrollProgressAndBackTop />
      <Reveal />
      <CookieBanner />
    </LangProvider>
  );
}
