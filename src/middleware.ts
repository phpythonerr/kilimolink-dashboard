import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";

// Define allowed organization domains
const ALLOWED_EMAIL_DOMAINS = ["kilimolink.com"];

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/auth/login"];

interface UserMetadata {
  user_type?: string;
  status?: string;
}

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SB_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
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

  await updateSession(request);

  const pathname = request.nextUrl.pathname;

  // Check if the route is public
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return res;
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return redirectToLogin(request, "Please Login to Access this Page");
    }

    // Check if user has an email
    if (!user.email) {
      await supabase.auth.signOut();
      return redirectToLogin(request, "Invalid Email");
    }

    // Check if email domain is allowed
    const emailDomain = user.email.split("@")[1];
    if (!ALLOWED_EMAIL_DOMAINS.includes(emailDomain)) {
      await supabase.auth.signOut();
      return redirectToLogin(request, "Unauthorized Email Domain");
    }

    // Check user type and status
    const metadata = user.user_metadata as UserMetadata;
    if (metadata.user_type !== "staff" || metadata.status !== "active") {
      return redirectToLogin(request, "Unauthorized Access");
    }

    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    return redirectToLogin(request, "Server Error");
  }
}

// Helper function for redirects
function redirectToLogin(request: NextRequest, message: string): NextResponse {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("message", message);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
