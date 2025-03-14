import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// Define allowed organization domains
const ALLOWED_EMAIL_DOMAINS = ["kilimolink.com"];

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/auth/login"];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client with proper typing
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SB_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Check if the request is for a public asset
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/static") ||
    req.nextUrl.pathname.startsWith("/favicon.ico") ||
    req.nextUrl.pathname.startsWith("/public/")
  ) {
    return res;
  }

  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return res;
  }

  try {
    // Get user data with proper typing
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If no user or error, redirect to login
    if (error || !user) {
      const redirectUrl = new URL("/auth/login", req.url);
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user email belongs to allowed domains
    const userEmail = user?.email;
    if (!userEmail) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL("/auth/login?error=invalid_email", req.url)
      );
    }

    const emailDomain = userEmail.split("@")[1];
    const isAllowedEmail = ALLOWED_EMAIL_DOMAINS.includes(emailDomain);

    if (!isAllowedEmail) {
      // Sign out the user
      await supabase.auth.signOut();

      // Log the unauthorized access attempt
      await supabase.from("access_logs").insert({
        user_id: user.id,
        path: req.nextUrl.pathname,
        method: req.method,
        ip_address: req.ip || "unknown",
        timestamp: new Date().toISOString(),
        status: "unauthorized_domain",
        email_domain: emailDomain,
      });

      return NextResponse.redirect(
        new URL("/auth/login?error=unauthorized_domain", req.url)
      );
    }

    // Set basic security headers
    res.headers.set("X-Frame-Options", "DENY");
    res.headers.set("X-Content-Type-Options", "nosniff");
    res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=server_error", req.url)
    );
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
