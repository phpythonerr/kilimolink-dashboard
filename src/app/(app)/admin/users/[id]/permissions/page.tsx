import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { UserPermissionsManager } from "./user-permissions-manager";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function UserPermissionsPage({ params }: any) {
  const supabase = await createClient();

  // Fetch the user
  const {
    data: { user },
  } = await supabase.auth.admin.getUserById(params.id);

  if (!user) {
    notFound();
  }

  // Fetch all permissions
  const { data: permissions } = await supabase
    .from("permissions")
    .select("*")
    .order("name");

  // Fetch user permissions
  const { data: userPermissions } = await supabase
    .from("user_permissions")
    .select("permission_id")
    .eq("user_id", params.id);

  const assignedPermissionIds =
    userPermissions?.map((up: any) => up.permission_id) || [];

  // Fetch user profile for display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  const userDisplayName = profile?.full_name || user.email || "User";

  // Fetch user's roles and their permissions
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", params.id);

  const roleIds = userRoles?.map((ur: any) => ur.role_id) || [];

  let rolePermissionIds: string[] = [];
  if (roleIds.length > 0) {
    const { data: rolePermissions } = await supabase
      .from("role_permissions")
      .select("permission_id")
      .in("role_id", roleIds);

    rolePermissionIds =
      rolePermissions?.map((rp: any) => rp.permission_id) || [];
  }

  const breadcrumbs = [
    { title: "Admin", href: "/admin" },
    { title: "Users", href: "/admin/users" },
    { title: userDisplayName, href: `/admin/users/${params.id}` },
    { title: "Permissions", href: `/admin/users/${params.id}/permissions` },
  ];

  return (
    <div className="p-4 space-y-4">
      <AppBreadCrumbs items={breadcrumbs} />

      <UserPermissionsManager
        userId={params.id}
        userName={userDisplayName}
        permissions={permissions || []}
        assignedPermissionIds={assignedPermissionIds}
        rolePermissionIds={rolePermissionIds}
      />
    </div>
  );
}
