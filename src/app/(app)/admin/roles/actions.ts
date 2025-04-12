'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const RoleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

export async function createRole(formData: FormData) {
  const supabase = await createClient();
  
  const validatedFields = RoleSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });
  
  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }
  
  const { name, description } = validatedFields.data;
  
  // Check if role with same name exists
  const { data: existingRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", name)
    .single();
  
  if (existingRole) {
    return { error: "A role with this name already exists" };
  }
  
  const { error } = await supabase
    .from("roles")
    .insert({ name, description });
  
  if (error) {
    console.error("Failed to create role:", error);
    return { error: "Failed to create role" };
  }
  
  revalidatePath('/admin/roles');
  return { success: true };
}

export async function updateRole(id: string, formData: FormData) {
  const supabase = await createClient();
  
  const validatedFields = RoleSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });
  
  if (!validatedFields.success) {
    return { error: validatedFields.error.errors[0].message };
  }
  
  const { name, description } = validatedFields.data;
  
  // Check if another role with same name exists
  const { data: existingRole } = await supabase
    .from("roles")
    .select("id")
    .eq("name", name)
    .neq("id", id)
    .single();
  
  if (existingRole) {
    return { error: "Another role with this name already exists" };
  }
  
  const { error } = await supabase
    .from("roles")
    .update({ name, description })
    .eq("id", id);
  
  if (error) {
    console.error("Failed to update role:", error);
    return { error: "Failed to update role" };
  }
  
  revalidatePath('/admin/roles');
  return { success: true };
}

export async function deleteRole(id: string) {
  const supabase = await createClient();
  
  // First check if there are any user_roles entries for this role
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("id")
    .eq("role_id", id);
  
  if (userRoles && userRoles.length > 0) {
    return { error: "Cannot delete role that is assigned to users" };
  }
  
  // Delete role_permissions entries first
  await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", id);
  
  // Now delete the role
  const { error } = await supabase
    .from("roles")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Failed to delete role:", error);
    return { error: "Failed to delete role" };
  }
  
  revalidatePath('/admin/roles');
  return { success: true };
}