"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function assignRolesToUser(userId: string, roleIds: string[]) {
  if (roleIds.length === 0) {
    return { success: true };
  }

  const supabase = await createClient();

  // Create records for user_roles table
  const userRoles = roleIds.map((roleId: any) => ({
    user_id: userId,
    role_id: roleId,
  }));

  const { error } = await supabase.from("user_roles").insert(userRoles);

  if (error) {
    console.error("Failed to assign roles:", error);
    return { error: "Failed to assign roles to user" };
  }

  revalidatePath(`/admin/users/${userId}/roles`);
  return { success: true };
}

export async function removeRolesFromUser(userId: string, roleIds: string[]) {
  if (roleIds.length === 0) {
    return { success: true };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .in("role_id", roleIds);

  if (error) {
    console.error("Failed to remove roles:", error);
    return { error: "Failed to remove roles from user" };
  }

  revalidatePath(`/admin/users/${userId}/roles`);
  return { success: true };
}
