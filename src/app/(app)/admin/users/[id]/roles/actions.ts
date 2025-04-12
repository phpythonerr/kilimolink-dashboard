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

// Action to assign a role to a user
export async function assignUserRole(userId: string, roleId: string) {
  try {
    const supabase = await createClient();

    // Check if the user exists
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      return { error: "User not found" };
    }

    // Check if the role exists
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("id", roleId)
      .single();

    if (roleError || !role) {
      return { error: "Role not found" };
    }

    // Check if the user already has this role
    const { data: existingRole, error: existingRoleError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role_id", roleId)
      .maybeSingle();

    if (existingRole) {
      return { error: "User already has this role" };
    }

    // Assign the role to the user
    const { error: insertError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role_id: roleId,
    });

    if (insertError) {
      console.error("Error assigning role:", insertError);
      return { error: "Failed to assign role" };
    }

    // Revalidate the cache for the user roles page
    revalidatePath(`/admin/users/${userId}/roles`);

    return { success: true };
  } catch (error) {
    console.error("Error in assignUserRole:", error);
    return { error: "An unexpected error occurred" };
  }
}

// Action to delete a user role
export async function deleteUserRole(formData: FormData) {
  try {
    const userRoleId = formData.get("userRoleId") as string;
    const userId = formData.get("userId") as string;

    if (!userRoleId || !userId) {
      return { error: "Missing required data" };
    }

    const supabase = await createClient();

    // Delete the user role
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("id", userRoleId);

    if (error) {
      console.error("Error deleting user role:", error);
      return { error: "Failed to delete role" };
    }

    // Revalidate the cache for the user roles page
    revalidatePath(`/admin/users/${userId}/roles`);

    return { success: true };
  } catch (error) {
    console.error("Error in deleteUserRole:", error);
    return { error: "An unexpected error occurred" };
  }
}
