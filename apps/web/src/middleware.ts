import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/auth/login", "/auth/register", "/auth/verify-email"];
const PUBLIC_PAGES = [...AUTH_PAGES];
const SESSION_COOKIE = "better-auth.session_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

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
    // Match all routes except static files and API
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
