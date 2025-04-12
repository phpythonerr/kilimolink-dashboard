import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { RoleForm } from "./role-form";

interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default async function EditRolePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  // Fetch the role details
  const { data: role, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !role) {
    console.error("Error fetching role:", error?.message);
    notFound();
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Role</h1>
      <RoleForm initialData={role as Role} />
    </div>
  );
}
