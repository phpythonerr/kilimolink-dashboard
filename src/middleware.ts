import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/middleware";
import { PERMISSION_MAP } from "@/app/permissions";

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

  // User is authenticated, now check permissions for the requested route
  if (session?.user?.id) {
    // Check if this route requires permissions
    const requiredPermissions = getRequiredPermissionsForPath(pathname);

    if (requiredPermissions.length > 0) {
      // Get user permissions
      const { data: userPermissions } = await supabase
        .from("user_permissions")
        .select("permission_id")
        .eq("user_id", session.user.id);

      // Get user's roles
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", session.user.id);

      const roleIds = userRoles?.map((ur) => ur.role_id) || [];

      // Get role permissions
      let rolePermissions: { permission_id: string }[] = [];
      if (roleIds.length > 0) {
        const { data: permissions } = await supabase
          .from("role_permissions")
          .select("permission_id")
          .in("role_id", roleIds);

        rolePermissions = permissions || [];
      }

      // Get all permission IDs
      const permissionIds = [
        ...(userPermissions?.map((up) => up.permission_id) || []),
        ...(rolePermissions?.map((rp) => rp.permission_id) || []),
      ];

      if (permissionIds.length > 0) {
        // Get the full permission details
        const { data: fullPermissions } = await supabase
          .from("permissions")
          .select("*")
          .in("id", permissionIds);

        const userPermissionNames = fullPermissions?.map((p) => p.name) || [];

        // Check if user has ALL required permissions
        const hasAllPermissions = requiredPermissions.every((permission) =>
          userPermissionNames.includes(permission)
        );

        if (!hasAllPermissions) {
          // Redirect to page-not-found route within the app layout
          return NextResponse.redirect(new URL("/page-not-found", request.url));
        }
      } else {
        // User has no permissions but the route requires them
        return NextResponse.redirect(new URL("/page-not-found", request.url));
      }
    }
  }

  // User is authenticated and has required permissions, allow access
  return response;
}

// Helper function to get required permissions for a path
function getRequiredPermissionsForPath(pathname: string): string[] {
  // First check for exact matches in the PERMISSION_MAP
  if ((PERMISSION_MAP as any)[pathname]) {
    return (PERMISSION_MAP as any)[pathname].permissions;
  }

  // Check for dynamic route patterns with parameters
  const pathSegments = pathname.split("/");

  // Store potential matches to find the most specific one
  let bestMatch: string | null = null;
  let bestMatchSegments = 0;

  for (const route in PERMISSION_MAP) {
    const routeSegments = route.split("/");

    // Skip if different number of segments (unless the route ends with a parameter)
    if (
      routeSegments.length !== pathSegments.length &&
      !(
        routeSegments[routeSegments.length - 1].startsWith("[") &&
        routeSegments.length <= pathSegments.length
      )
    ) {
      continue;
    }

    let isMatch = true;
    for (
      let i = 0;
      i < Math.min(routeSegments.length, pathSegments.length);
      i++
    ) {
      // Dynamic segments (e.g., [id]) always match
      if (routeSegments[i].startsWith("[") && routeSegments[i].endsWith("]")) {
        continue;
      }

      // Otherwise, segments must match exactly
      if (routeSegments[i] !== pathSegments[i]) {
        isMatch = false;
        break;
      }
    }

    if (isMatch && routeSegments.length > bestMatchSegments) {
      bestMatch = route;
      bestMatchSegments = routeSegments.length;
    }
  }

  if (bestMatch) {
    return (PERMISSION_MAP as any)[bestMatch].permissions;
  }

  return [];
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
