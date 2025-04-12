"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function assignPermissionsToUser(
  userId: string,
  permissionIds: string[]
) {
  if (permissionIds.length === 0) {
    return { success: true };
  }

  const supabase = await createClient();

  // Create records for user_permissions table
  const userPermissions = permissionIds.map((permissionId: any) => ({
    user_id: userId,
    permission_id: permissionId,
  }));

  const { error } = await supabase
    .from("user_permissions")
    .insert(userPermissions);

  if (error) {
    console.error("Failed to assign permissions:", error);
    return { error: "Failed to assign permissions to user" };
  }

  revalidatePath(`/admin/users/${userId}/permissions`);
  return { success: true };
}

export async function removePermissionsFromUser(
  userId: string,
  permissionIds: string[]
) {
  if (permissionIds.length === 0) {
    return { success: true };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("user_permissions")
    .delete()
    .eq("user_id", userId)
    .in("permission_id", permissionIds);

  if (error) {
    console.error("Failed to remove permissions:", error);
    return { error: "Failed to remove permissions from user" };
  }

  revalidatePath(`/admin/users/${userId}/permissions`);
  return { success: true };
}
