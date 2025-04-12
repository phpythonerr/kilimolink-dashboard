import { createClient } from "./supabase/server";
import { Permission, Role, UserWithPermissions } from "./supabase/types";
import { PERMISSION_MAP } from "@/app/permissions";

/**
 * Get all permissions for a user by combining role-based permissions and direct user permissions
 */
export async function getUserPermissions(
  userId: string
): Promise<Permission[]> {
  const supabase = await createClient();

  // Get user's direct permissions
  const { data: userPermissions } = await supabase
    .from("user_permissions")
    .select("permission_id")
    .eq("user_id", userId);

  // Get user's roles
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);

  // Get role permissions
  const roleIds = userRoles?.map((ur) => ur.role_id) || [];

  let rolePermissions: { permission_id: string }[] = [];
  if (roleIds.length > 0) {
    const { data: permissions } = await supabase
      .from("role_permissions")
      .select("permission_id")
      .in("role_id", roleIds);

    rolePermissions = permissions || [];
  }

  // Combine direct permissions and role permissions
  const permissionIds = new Set([
    ...(userPermissions?.map((up) => up.permission_id) || []),
    ...(rolePermissions?.map((rp) => rp.permission_id) || []),
  ]);

  if (permissionIds.size === 0) {
    return [];
  }

  // Get the full permission details
  const { data: fullPermissions } = await supabase
    .from("permissions")
    .select("*")
    .in("id", Array.from(permissionIds));

  return fullPermissions || [];
}

/**
 * Check if a user has a specific permission
 */
export async function hasPermission(
  userId: string,
  permissionName: string
): Promise<boolean> {
  const permissions = await getUserPermissions(userId);
  return permissions.some((p: any) => p.name === permissionName);
}

/**
 * Check if a user has a specific role
 */
export async function hasRole(
  userId: string,
  roleName: string
): Promise<boolean> {
  const supabase = await createClient();

  // Get the role by name
  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .single();

  if (!role) return false;

  // Check if user has this role
  const { data: userRole } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role_id", role.id)
    .single();

  return !!userRole;
}

/**
 * Get full user information with roles and permissions
 */
export async function getUserWithPermissions(
  userId: string
): Promise<UserWithPermissions | null> {
  const supabase = await createClient();

  // Get user
  const { data: user } = await supabase.auth.admin.getUserById(userId);

  if (!user) return null;

  // Get user's roles
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", userId);

  const roleIds = userRoles?.map((ur) => ur.role_id) || [];

  let roles: Role[] = [];
  if (roleIds.length > 0) {
    const { data: rolesData } = await supabase
      .from("roles")
      .select("*")
      .in("id", roleIds);

    roles = rolesData || [];
  }

  // Get permissions
  const permissions = await getUserPermissions(userId);

  return {
    id: user?.user?.id || "",
    email: user?.user?.email || "",
    user_metadata: user?.user?.user_metadata,
    roles,
    permissions,
  };
}

/**
 * Check if a permission is required for a route
 */
export function getRequiredPermissions(pathname: string): string[] {
  // First check for exact matches in the PERMISSION_MAP
  if (PERMISSION_MAP[pathname]) {
    return PERMISSION_MAP[pathname].permissions;
  }

  // Check for dynamic route patterns in PERMISSION_MAP
  const dynamicPathSegments = pathname.split("/");

  // Store potential matches to find the most specific one
  let bestMatch: string | null = null;
  let bestMatchSegments = 0;

  for (const route in PERMISSION_MAP) {
    const routeSegments = route.split("/");

    // Skip if different number of segments (unless the route ends with a parameter)
    if (
      routeSegments.length !== dynamicPathSegments.length &&
      !(
        routeSegments[routeSegments.length - 1].startsWith("[") &&
        routeSegments.length <= dynamicPathSegments.length
      )
    ) {
      continue;
    }

    let isMatch = true;
    for (
      let i = 0;
      i < Math.min(routeSegments.length, dynamicPathSegments.length);
      i++
    ) {
      // Dynamic segments (e.g., [id]) always match
      if (routeSegments[i].startsWith("[") && routeSegments[i].endsWith("]")) {
        continue;
      }

      // Otherwise, segments must match exactly
      if (routeSegments[i] !== dynamicPathSegments[i]) {
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
    return PERMISSION_MAP[bestMatch].permissions;
  }

  // If no specific match was found, check for path-based matches
  // (e.g., /orders prefixes)
  let longestPrefixMatch = "";

  for (const route in PERMISSION_MAP) {
    // Skip dynamic routes in this check
    if (route.includes("[")) continue;

    if (
      pathname.startsWith(route) &&
      route.length > longestPrefixMatch.length &&
      (pathname === route || pathname.charAt(route.length) === "/")
    ) {
      longestPrefixMatch = route;
    }
  }

  if (longestPrefixMatch) {
    return PERMISSION_MAP[longestPrefixMatch].permissions;
  }

  return [];
}
