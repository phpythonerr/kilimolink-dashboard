import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { cache } from "react";

// Define types
export type Permission = string;

export interface NavItem {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  permission: Permission;
  items?: NavItem[];
}

// Create a cached function to get user permissions
export const getUserPermissions = cache(async () => {
  const cookieStore = cookies();
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Get user's role-based permissions

  const { data: userRoleIds, error: userRoleIdsError } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", user.id);

  const { data: rolePermissions } = await supabase
    .from("role_permissions")
    .select(
      `
      permissions (
        name
      ),
      roles!inner (
        id
      )
    `
    )
    .in("roles.id", userRoleIds);

  // Get user's additional permissions
  const { data: userPermissions } = await supabase
    .from("user_permissions")
    .select(
      `
      permissions (
        name
      )
    `
    )
    .eq("user_id", user.id);

  // Combine and deduplicate permissions
  const permissions = new Set<string>();

  rolePermissions?.forEach((rp) => {
    if (rp.permissions?.name) {
      permissions.add(rp.permissions.name);
    }
  });

  userPermissions?.forEach((up) => {
    if (up.permissions?.name) {
      permissions.add(up.permissions.name);
    }
  });

  return Array.from(permissions);
});

// Check if user has a specific permission
export async function hasPermission(permission: Permission): Promise<boolean> {
  const permissions: any = await getUserPermissions();

  // Check exact permission
  if (permissions.includes(permission)) return true;

  // Check wildcard permissions (e.g., "reports.*" would match "reports.finance.orders.view")
  const parts: any = permission?.split(".");
  for (let i = 1; i <= parts?.length; i++) {
    const partialPermission = [...parts?.slice(0, i), "*"].join(".");
    if (permissions?.includes(partialPermission)) return true;
  }

  return false;
}

// Filter navigation items based on permissions
export async function getAuthorizedNavItems(
  items: NavItem[]
): Promise<NavItem[]> {
  const authorizedItems: NavItem[] = [];

  for (const item of items) {
    if (await hasPermission(item.permission)) {
      const authorizedItem = { ...item };

      if (item.items && item.items.length > 0) {
        authorizedItem.items = await getAuthorizedNavItems(item.items);
      }

      authorizedItems.push(authorizedItem);
    }
  }

  return authorizedItems;
}
