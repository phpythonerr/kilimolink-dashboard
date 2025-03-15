import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { cache } from "react";
import { LucideIcon } from "lucide-react";

// Define types
export type Permission = string;

interface UserRole {
  role_id: string;
}

interface PermissionRecord {
  name: string;
}

interface RolePermission {
  permissions: PermissionRecord[];
  roles: {
    id: string;
  }[];
}

interface UserPermission {
  permissions: PermissionRecord;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  permission?: Permission;
  isActive?: boolean;
  items?: NavItem[];
}

// Create a cached function to get user permissions
export const getUserPermissions = cache(async (): Promise<string[]> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  // Get user's role-based permissions
  const { data: userRoleIds } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", user.id);

  if (!userRoleIds?.length) return [];

  const roleIds = userRoleIds.map((role: UserRole) => role.role_id);

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
    .in("roles.id", roleIds);

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

  if (rolePermissions) {
    (rolePermissions as unknown as RolePermission[]).forEach((rp: any) => {
      rp.permissions.forEach((permission: any) => {
        if (permission.name) {
          permissions.add(permission.name);
        }
      });
    });
  }

  ((userPermissions as UserPermission[]) || []).forEach((up: any) => {
    if (up.permissions?.name) {
      permissions.add(up.permissions.name);
    }
  });

  return Array.from(permissions);
});

// Check if user has a specific permission
export async function hasPermission(permission?: Permission): Promise<boolean> {
  if (!permission) return true;

  const permissions = await getUserPermissions();

  // Check exact permission
  if (permissions.includes(permission)) return true;

  // Check wildcard permissions (e.g., "reports.*" would match "reports.finance.orders.view")
  const parts = permission.split(".");
  for (let i = 1; i <= parts.length; i++) {
    const partialPermission = [...parts.slice(0, i), "*"].join(".");
    if (permissions.includes(partialPermission)) return true;
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

      if (item.items?.length) {
        authorizedItem.items = await getAuthorizedNavItems(item.items);
      }

      // Only add items that have no subitems or have authorized subitems
      if (!item.items || authorizedItem.items?.length) {
        authorizedItems.push(authorizedItem);
      }
    }
  }

  return authorizedItems;
}
