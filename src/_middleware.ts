// middleware.ts - Place this file in your project root
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";
// import {
//   hasRequiredPermissions,
//   getPermissionRuleForPath,
// } from "@/lib/permissions";

// Define allowed organization domains
const ALLOWED_EMAIL_DOMAINS = ["kilimolink.com"];

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/auth/login"];

/**
 * Checks if a user has the required permissions for a route
 */

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Create Supabase client
  const supabase = await createClient();

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
    // Get user data
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If no user or error, redirect to login
    if (error || !user) {
      // Store the original URL to redirect back after login
      const redirectUrl = new URL("/auth/login", req.url);
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname);

      return NextResponse.redirect(redirectUrl);
    }

    // Check if user email belongs to the organization
    const userEmail = user?.email;

    if (!userEmail) {
      return NextResponse.redirect(
        new URL("/auth/login?error=invalid_email", req.url)
      );
    }

    const emailDomain = userEmail.split("@")[1];
    const isOrgEmail = ALLOWED_EMAIL_DOMAINS.includes(emailDomain);

    if (!isOrgEmail) {
      return NextResponse.redirect(
        new URL("/unauthorized?reason=domain", req.url)
      );
    }

    // Check for JWT expiration and refresh if needed
    // const expirationTime = session.expires_at * 1000; // convert to milliseconds
    // const currentTime = Date.now();
    // const timeUntilExpiration = expirationTime - currentTime;

    // // If token is about to expire (less than 5 minutes), refresh it
    // if (timeUntilExpiration < 5 * 60 * 1000) {
    //   await supabase.auth.refreshSession();
    // }

    // Check permission requirements for the requested path
    const currentPath = req.nextUrl.pathname;
    // const permissionRule = getPermissionRuleForPath(currentPath);

    // if (permissionRule) {
    //   const userHasPermission = await hasRequiredPermissions(
    //     supabase,
    //     user?.id,
    //     permissionRule.permissions
    //   );

    //   if (!userHasPermission) {
    //     // Log unauthorized access attempt
    //     await supabase.from("security_logs").insert({
    //       user_id: user?.id,
    //       action: "unauthorized_access_attempt",
    //       resource: currentPath,
    //       ip_address: req.ip || "unknown",
    //       user_agent: req.headers.get("user-agent") || "unknown",
    //       required_permissions: permissionRule.permissions,
    //     });

    //     return NextResponse.redirect(
    //       new URL(permissionRule.redirectPath, req.url)
    //     );
    //     // return new NextResponse(null, {
    //     //   status: 404,
    //     //   statusText: "Not Found",
    //     // });
    //   }
    // }

    // Set security headers
    const responseHeaders = res.headers;
    responseHeaders.set("X-Frame-Options", "DENY");
    responseHeaders.set("X-Content-Type-Options", "nosniff");
    responseHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
    responseHeaders.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    responseHeaders.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; object-src 'none';"
    );

    // Add user context to headers for debugging and logging
    const contextData = JSON.stringify({
      userId: user?.id,
      timestamp: Date.now(),
    });

    const contextHeader =
      process.env.NODE_ENV === "production"
        ? encrypt(contextData, process.env.ENCRYPTION_KEY!)
        : Buffer.from(contextData).toString("base64");

    responseHeaders.set("X-Auth-Context", contextHeader);

    // Log successful access (optional, for audit trails)
    await supabase.from("access_logs").insert({
      user_id: user?.id,
      path: currentPath,
      method: req.method,
      ip_address: req.ip || "unknown",
      timestamp: new Date().toISOString(),
    });

    return res;
  } catch (error) {
    console.error("Middleware error:", error);

    // Fail secure - redirect to login on any error
    return NextResponse.redirect(
      new URL("/auth/login?error=server_error", req.url)
    );
  }
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
