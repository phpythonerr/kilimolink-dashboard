"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PermissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export async function createPermission(formData: FormData) {
  const supabase = await createClient();

  const validatedFields = PermissionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const { name, description } = validatedFields.data;

  // Check if permission with same name exists
  const { data: existingPermission } = await supabase
    .from("permissions")
    .select("id")
    .eq("name", name)
    .single();

  if (existingPermission) {
    return { error: "A permission with this name already exists" };
  }

  const { error } = await supabase
    .from("permissions")
    .insert({ name, description });

  if (error) {
    console.error("Failed to create permission:", error);
    return { error: "Failed to create permission" };
  }

  revalidatePath("/admin/permissions");
  return { success: true };
}

export async function updatePermission(id: string, formData: FormData) {
  const supabase = await createClient();

  const validatedFields = PermissionSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }

  const { name, description } = validatedFields.data;

  // Check if another permission with same name exists
  const { data: existingPermission } = await supabase
    .from("permissions")
    .select("id")
    .eq("name", name)
    .neq("id", id)
    .single();

  if (existingPermission) {
    return { error: "Another permission with this name already exists" };
  }

  const { error } = await supabase
    .from("permissions")
    .update({ name, description })
    .eq("id", id);

  if (error) {
    console.error("Failed to update permission:", error);
    return { error: "Failed to update permission" };
  }

  revalidatePath("/admin/permissions");
  return { success: true };
}

export async function deletePermission(id: string) {
  const supabase = await createClient();

  // First check if there are any role_permissions entries or user_permissions entries for this permission
  const { data: rolePermissions } = await supabase
    .from("role_permissions")
    .select("id")
    .eq("permission_id", id);

  if (rolePermissions && rolePermissions.length > 0) {
    return { error: "Cannot delete permission that is assigned to roles" };
  }

  const { data: userPermissions } = await supabase
    .from("user_permissions")
    .select("id")
    .eq("permission_id", id);

  if (userPermissions && userPermissions.length > 0) {
    return { error: "Cannot delete permission that is assigned to users" };
  }

  // Now delete the permission
  const { error } = await supabase.from("permissions").delete().eq("id", id);

  if (error) {
    console.error("Failed to delete permission:", error);
    return { error: "Failed to delete permission" };
  }

  revalidatePath("/admin/permissions");
  return { success: true };
}
