import type { ReactNode } from "react";
import { LangProvider } from "@/lib/i18n";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { CookieBanner } from "@/components/shared/CookieBanner";
import { getServerLang } from "@/lib/lang-server";

export const dynamic = "force-dynamic";

export default async function LegalLayout({ children }: { children: ReactNode }) {
  const lang = await getServerLang();
  return (
    <LangProvider initialLang={lang}>
      <Nav />
      <main id="main" className="wrap py-16 md:py-20">
        <article className="max-w-[760px] mx-auto legal-prose">{children}</article>
      </main>
      <Footer />
      <CookieBanner />
    </LangProvider>
  );
}
