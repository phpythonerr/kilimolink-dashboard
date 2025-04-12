import { createClient } from "@/lib/supabase/server";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RolesList } from "./roles-list";
import Link from "next/link";

export default async function RolesPage() {
  const supabase = await createClient();

  // Fetch all roles
  const { data: roles } = await supabase
    .from("roles")
    .select("*")
    .order("name");

  const breadcrumbs = [
    { title: "Admin", href: "/admin" },
    { title: "Roles", href: "/admin/roles" },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <AppBreadCrumbs items={breadcrumbs} />

        <Button asChild>
          <Link href="/admin/roles/new">Create New Role</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Manage user roles in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <RolesList roles={roles || []} />
        </CardContent>
      </Card>
    </div>
  );
}
