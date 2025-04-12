"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface UpdateRoleParams {
  name: string;
  description: string;
}

export async function updateRole(id: string, data: UpdateRoleParams) {
  try {
    const supabase = await createClient();

    const { data: updatedRole, error } = await supabase
      .from("roles")
      .update({
        name: data.name,
        description: data.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    // Revalidate the roles page to show updated data
    revalidatePath("/admin/roles");

    return { success: true, data: updatedRole };
  } catch (error: any) {
    return { error: error.message || "Failed to update role" };
  }
}
