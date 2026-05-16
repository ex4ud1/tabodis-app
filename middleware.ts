import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

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

  return updateSession(request);
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
