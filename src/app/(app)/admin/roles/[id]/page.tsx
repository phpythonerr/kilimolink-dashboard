import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { RoleForm } from "../role-form";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditRolePage({ params }: PageProps) {
  const supabase = await createClient();

  // Fetch role data
  const { data: role } = await supabase
    .from("roles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!role) {
    notFound();
  }

  const breadcrumbs = [
    { title: "Admin", href: "/admin" },
    { title: "Roles", href: "/admin/roles" },
    { title: "Edit", href: `/admin/roles/${params.id}` },
  ];

  return (
    <div className="p-4 space-y-4">
      <AppBreadCrumbs items={breadcrumbs} />
      <RoleForm role={role} />
    </div>
  );
}
