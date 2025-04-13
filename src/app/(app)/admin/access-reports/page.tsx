import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { UserRolesTable } from "./user-roles-table";
import { RolePermissionsTable } from "./role-permissions-table";
import { UserPermissionsTable } from "./user-permissions-table";

export const dynamic = "force-dynamic";

export default async function AccessReportsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  // Get the active tab from the URL params or default to "user-roles"
  const activeTab = searchParams.tab || "user-roles";

  // Get pagination parameters from the URL
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;

  const supabase = await createClient();

  // Fetch summary statistics
  const { data: roleCount } = await supabase
    .from("roles")
    .select("id", { count: "exact", head: true });

  const { data: permissionCount } = await supabase
    .from("permissions")
    .select("id", { count: "exact", head: true });

  const { data: userRoleCount } = await supabase
    .from("user_roles")
    .select("id", { count: "exact", head: true });

  const { data: userPermissionCount } = await supabase
    .from("user_permissions")
    .select("id", { count: "exact", head: true });

  const { data: rolePermissionCount } = await supabase
    .from("role_permissions")
    .select("id", { count: "exact", head: true });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Access Reports</h2>
        <p className="text-muted-foreground">
          View comprehensive reports on user roles, permissions, and access
          patterns
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleCount?.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Defined system roles
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissionCount?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Defined system permissions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Role Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userRoleCount?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total user role assignments
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Direct Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userPermissionCount?.count || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Direct permission assignments
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="user-roles">User Roles</TabsTrigger>
          <TabsTrigger value="role-permissions">Role Permissions</TabsTrigger>
          <TabsTrigger value="user-permissions">User Permissions</TabsTrigger>
        </TabsList>
        <TabsContent value="user-roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Role Assignments</CardTitle>
              <CardDescription>
                Overview of roles assigned to each user in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* <UserRolesTable page={page} pageSize={pageSize} /> */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="role-permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Permission Matrix</CardTitle>
              <CardDescription>
                Overview of permissions assigned to each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* <RolePermissionsTable page={page} pageSize={pageSize} /> */}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="user-permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Direct User Permissions</CardTitle>
              <CardDescription>
                Permissions granted directly to users, bypassing roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* <UserPermissionsTable page={page} pageSize={pageSize} /> */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
