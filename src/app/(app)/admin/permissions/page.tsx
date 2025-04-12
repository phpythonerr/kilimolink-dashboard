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
import Link from "next/link";
import { PermissionsList } from "./permissions-list";

export default async function PermissionsPage() {
  const supabase = await createClient();

  // Fetch all permissions
  const { data: permissions } = await supabase
    .from("permissions")
    .select("*")
    .order("name");

  const breadcrumbs = [
    { title: "Admin", href: "/admin" },
    { title: "Permissions", href: "/admin/permissions" },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <AppBreadCrumbs items={breadcrumbs} />

        <Button asChild>
          <Link href="/admin/permissions/new">Create New Permission</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>
            Manage system permissions that can be assigned to roles or users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionsList permissions={permissions || []} />
        </CardContent>
      </Card>
    </div>
  );
}
