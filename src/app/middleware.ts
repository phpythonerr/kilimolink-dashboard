// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRequiredPermission } from "@/config/routePermissions";

export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createClient();

    // Check user authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If not authenticated and not on auth routes, redirect to login
    if (!user && !request.nextUrl.pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // If authenticated, check if email is from organization domain
    if (user && !request.nextUrl.pathname.startsWith("/auth")) {
      const email = user.email;

      // Get allowed domains from environment or config
      const allowedDomains = process.env.ALLOWED_EMAIL_DOMAINS?.split(",") || [
        "kilimolink.com",
      ];
      const isOrgEmail =
        email && allowedDomains.some((domain) => email.endsWith(`@${domain}`));

      if (!isOrgEmail) {
        const unauthorizedUrl = new URL("/unauthorized", request.url);
        unauthorizedUrl.searchParams.set(
          "reason",
          "organization_email_required"
        );
        return NextResponse.redirect(unauthorizedUrl);
      }

      // Get required permission for the current path
      //   const path = request.nextUrl.pathname;
      //   const requiredPermission = getRequiredPermission(path);

      //   if (requiredPermission) {
      //     // Check role-based permissions
      //     const { data: userRoleIds, error: userRoleIdsError } = await supabase
      //       .from("user_roles")
      //       .select("role_id")
      //       .eq("user_id", user.id);
      //     const { data: rolePermissions, error: roleError } = await supabase
      //       .from("role_permissions")
      //       .select(
      //         `
      //         permissions!inner (
      //           name
      //         )
      //       `
      //       )
      //       .in("role_id", userRoleIds)
      //       .eq("permissions.name", requiredPermission);

      //     // Check user-specific permissions
      //     const { data: userPermissions, error: userError } = await supabase
      //       .from("user_permissions")
      //       .select(
      //         `
      //         permissions!inner (
      //           name
      //         )
      //       `
      //       )
      //       .eq("user_id", user.id)
      //       .eq("permissions.name", requiredPermission);

      //     // If no permissions match, check for wildcard permissions
      //     if (
      //       (!rolePermissions || rolePermissions.length === 0) &&
      //       (!userPermissions || userPermissions.length === 0)
      //     ) {
      //       // Check for wildcard permissions
      //       const permissionParts = requiredPermission.split(".");
      //       let hasWildcardPermission = false;

      //       // Check each level of permission hierarchy for wildcards
      //       // e.g., for "reports.finance.orders.view", check "reports.*", "reports.finance.*", etc.
      //       for (let i = 1; i < permissionParts.length; i++) {
      //         const wildcardPermission = [
      //           ...permissionParts.slice(0, i),
      //           "*",
      //         ].join(".");

      //         // Check role-based wildcard permissions
      //         const { data: roleWildcardPerms } = await supabase
      //           .from("role_permissions")
      //           .select(
      //             `
      //             permissions!inner (
      //               name
      //             )
      //           `
      //           )
      //           .in(
      //             "role_id",
      //             supabase
      //               .from("user_roles")
      //               .select("role_id")
      //               .eq("user_id", user.id)
      //           )
      //           .eq("permissions.name", wildcardPermission);

      //         // Check user-specific wildcard permissions
      //         const { data: userWildcardPerms } = await supabase
      //           .from("user_permissions")
      //           .select(
      //             `
      //             permissions!inner (
      //               name
      //             )
      //           `
      //           )
      //           .eq("user_id", user.id)
      //           .eq("permissions.name", wildcardPermission);

      //         if (
      //           (roleWildcardPerms && roleWildcardPerms.length > 0) ||
      //           (userWildcardPerms && userWildcardPerms.length > 0)
      //         ) {
      //           hasWildcardPermission = true;
      //           break;
      //         }
      //       }

      //       if (!hasWildcardPermission) {
      //         return NextResponse.rewrite(new URL("/404", request.url));
      //       }
      //     }
      //   }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

// Define which routes this middleware should run on
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|auth/login|unauthorized).*)",
  ],
};
