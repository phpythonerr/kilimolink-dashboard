import { createClient } from "./supabase/server";

/**
 * Assign a role to a user
 * @param userId The user ID to assign the role to
 * @param roleName The name of the role to assign
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function assignRoleToUser(
  userId: string,
  roleName: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Get the role by name
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", roleName)
      .single();

    if (roleError || !role) {
      console.error("Error finding role:", roleError || "Role not found");
      return false;
    }

    // Check if user already has this role
    const { data: existingRole, error: checkError } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .eq("role_id", role?.id)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing role:", checkError);
      return false;
    }

    // If role is already assigned, we're done
    if (existingRole) {
      return true;
    }

    // Assign role to user
    const { error: assignError } = await supabase.from("user_roles").insert({
      user_id: userId,
      role_id: role?.id,
    });

    if (assignError) {
      console.error("Error assigning role:", assignError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception assigning role to user:", error);
    return false;
  }
}

/**
 * Assign the Super Admin role to a user
 * @param userId The user ID to make a Super Admin
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function makeSuperAdmin(userId: string): Promise<boolean> {
  return assignRoleToUser(userId, "Super Admin");
}

/**
 * Remove a role from a user
 * @param userId The user ID to remove the role from
 * @param roleName The name of the role to remove
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function removeRoleFromUser(
  userId: string,
  roleName: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

    // Get the role by name
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", roleName)
      .single();

    if (roleError || !role) {
      console.error("Error finding role:", roleError || "Role not found");
      return false;
    }

    // Remove role from user
    const { error: removeError } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role_id", role?.id);

    if (removeError) {
      console.error("Error removing role:", removeError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception removing role from user:", error);
    return false;
  }
}
