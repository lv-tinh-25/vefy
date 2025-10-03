import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/auth/login", "/auth/register", "/auth/verify-email", "/auth/forgot-password"];
const PUBLIC_PAGES = [...AUTH_PAGES];
// better-auth prefixes the cookie with __Secure- on HTTPS
const SESSION_COOKIES = ["better-auth.session_token", "__Secure-better-auth.session_token"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));

  // Auth pages: redirect to /garage if already logged in
  if (AUTH_PAGES.some((p) => pathname.startsWith(p)) && hasSession) {
    return NextResponse.redirect(new URL("/garage", request.url));
  }

  // Complete-profile: only accessible when logged in
  if (pathname.startsWith("/auth/complete-profile") && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Protected routes: redirect to /auth/login if not logged in
  if (!PUBLIC_PAGES.some((p) => pathname.startsWith(p)) && !pathname.startsWith("/auth/") && !hasSession) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Everything except static assets, SEO files and the API
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|opengraph-image|robots.txt|sitemap.xml|manifest.webmanifest|api).*)",
  ],
};
