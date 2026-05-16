import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { COOKIE_KEY, COOKIE_MAX_AGE, isLang, type Lang } from "@/lib/lang-dict";

/**
 * Pick a default language from the Accept-Language header. We only support
 * three locales, so anything unrecognised falls back to "es".
 */
function detectLangFromHeader(header: string | null): Lang {
  if (!header) return "es";
  // Match the first language tag whose primary subtag is one of ours.
  const tags = header.split(",").map((s) => s.trim().split(";")[0].toLowerCase());
  for (const tag of tags) {
    if (tag.startsWith("uk")) return "uk";
    if (tag.startsWith("ru")) return "ru";
    if (tag.startsWith("es")) return "es";
  }
  return "es";
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";

  // Rewrite admin.tabodis.com/* → /admin/*
  if (host.startsWith("admin.")) {
    const url = request.nextUrl.clone();
    const skip =
      url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/auth") ||
      url.pathname.startsWith("/api") ||
      url.pathname.startsWith("/_next");
    if (!skip) {
      url.pathname = url.pathname === "/" ? "/admin" : "/admin" + url.pathname;
      return NextResponse.rewrite(url);
    }
  }

  const response = await updateSession(request);

  // On first visit set the lang cookie from Accept-Language so the very first
  // SSR render already uses the user's preferred locale. The cookie is read by
  // getServerLang() in layout.tsx / page.tsx. Subsequent visits keep whatever
  // the user picked via the Nav menu.
  const existing = request.cookies.get(COOKIE_KEY)?.value;
  if (!isLang(existing)) {
    const detected = detectLangFromHeader(request.headers.get("accept-language"));
    response.cookies.set(COOKIE_KEY, detected, {
      path: "/",
      maxAge: COOKIE_MAX_AGE,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - Public file extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
