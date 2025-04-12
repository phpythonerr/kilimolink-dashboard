"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function assignPermissionsToRole(
  roleId: string,
  permissionIds: string[]
) {
  if (permissionIds.length === 0) {
    return { success: true };
  }

  const supabase = await createClient();

  // Create records for role_permissions table
  const rolePermissions = permissionIds.map((permissionId: any) => ({
    role_id: roleId,
    permission_id: permissionId,
  }));

  const { error } = await supabase
    .from("role_permissions")
    .insert(rolePermissions);

  if (error) {
    console.error("Failed to assign permissions:", error);
    return { error: "Failed to assign permissions to role" };
  }

  revalidatePath(`/admin/roles/${roleId}/permissions`);
  return { success: true };
}

export async function removePermissionsFromRole(
  roleId: string,
  permissionIds: string[]
) {
  if (permissionIds.length === 0) {
    return { success: true };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId)
    .in("permission_id", permissionIds);

  if (error) {
    console.error("Failed to remove permissions:", error);
    return { error: "Failed to remove permissions from role" };
  }

  revalidatePath(`/admin/roles/${roleId}/permissions`);
  return { success: true };
}
