import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { UserRolesManager } from "./user-roles-manager";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function UserRolesPage({ params }: PageProps) {
  const supabase = await createClient();

  // Fetch the user
  const {
    data: { user },
  } = await supabase.auth.admin.getUserById(params.id);

  if (!user) {
    notFound();
  }

  // Fetch all roles
  const { data: roles } = await supabase
    .from("roles")
    .select("*")
    .order("name");

  // Fetch user roles
  const { data: userRoles } = await supabase
    .from("user_roles")
    .select("role_id")
    .eq("user_id", params.id);

  const assignedRoleIds = userRoles?.map((ur: any) => ur.role_id) || [];

  // Fetch user profile for display name
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .single();

  const userDisplayName = profile?.full_name || user.email || "User";

  const breadcrumbs = [
    { title: "Admin", href: "/admin" },
    { title: "Users", href: "/admin/users" },
    { title: userDisplayName, href: `/admin/users/${params.id}` },
    { title: "Roles", href: `/admin/users/${params.id}/roles` },
  ];

  return (
    <div className="p-4 space-y-4">
      <AppBreadCrumbs items={breadcrumbs} />

      <UserRolesManager
        userId={params.id}
        userName={userDisplayName}
        roles={roles || []}
        assignedRoleIds={assignedRoleIds}
      />
    </div>
  );
}
