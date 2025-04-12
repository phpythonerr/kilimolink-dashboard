import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const pathname = request.nextUrl.pathname;

  // Allow access to login page and static assets without authentication
  if (
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/legals/terms-of-service") ||
    pathname.startsWith("/legals/privacy-policy") ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/) ||
    pathname.startsWith("/_next")
  ) {
    return response;
  }

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // User is authenticated, allow access
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (images folder)
     * - api/ routes that don't require auth
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api/public).*)",
  ],
};
