import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { RolePermissionsManager } from "./role-permissions-manager";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function RolePermissionsPage({ params }: any) {
  const supabase = await createClient();

  const pageParams = await params;

  // Fetch the role
  const { data: role } = await supabase
    .from("roles")
    .select("*")
    .eq("id", pageParams.id)
    .single();

  if (!role) {
    notFound();
  }

  // Fetch all permissions
  const { data: permissions } = await supabase
    .from("permissions")
    .select("*")
    .order("name");

  // Fetch role permissions
  const { data: rolePermissions } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", pageParams.id);

  const assignedPermissionIds =
    rolePermissions?.map((rp: any) => rp.permission_id) || [];

  const breadcrumbs = [
    { title: "Admin", href: "/admin" },
    { title: "Roles", href: "/admin/roles" },
    { title: role.name, href: `/admin/roles/${pageParams.id}` },
    { title: "Permissions", href: `/admin/roles/${pageParams.id}/permissions` },
  ];

  return (
    <div className="p-4 space-y-4">
      <AppBreadCrumbs items={breadcrumbs} />

      <RolePermissionsManager
        role={role}
        permissions={permissions || []}
        assignedPermissionIds={assignedPermissionIds}
      />
    </div>
  );
}
