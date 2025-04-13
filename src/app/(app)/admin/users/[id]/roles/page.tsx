import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteUserRole } from "./actions";
import { UserRoleForm } from "./user-role-form";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function UserRolesPage({ params }: { params: any }) {
  const userId = params.id;
  const supabase = await createClient();

  // Fetch the user
  const { data: user, error: userError }: any = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("user_id", userId)
    .single();

  if (userError || !user) {
    return notFound();
  }

  // Fetch all available roles
  const { data: allRoles } = await supabase
    .from("roles")
    .select("id, name, description");

  // Fetch all roles assigned to the user
  const { data: userRoles, error: rolesError }: any = await supabase
    .from("user_roles")
    .select(
      `
      id,
      role: roles (
        id,
        name,
        description
      )
    `
    )
    .eq("user_id", userId);

  if (rolesError) {
    console.error("Error fetching user roles:", rolesError);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Manage User Roles</h3>
        <p className="text-sm text-muted-foreground">
          Assign or remove roles for user: {user.full_name} ({user.email})
        </p>
      </div>
      <Separator />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Roles</CardTitle>
            <CardDescription>
              Roles currently assigned to this user
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userRoles && userRoles.length > 0 ? (
              <div className="space-y-4">
                {userRoles.map((userRole: any) => (
                  <div
                    key={userRole?.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{userRole?.role.name}</h4>
                        <Badge variant="outline">Role</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {userRole?.role?.description}
                      </p>
                    </div>
                    <form action={deleteUserRole}>
                      <input
                        type="hidden"
                        name="userRoleId"
                        value={userRole.id}
                      />
                      <input type="hidden" name="userId" value={userId} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="icon"
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove Role</span>
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No roles assigned to this user yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assign Role</CardTitle>
            <CardDescription>Add a new role to this user</CardDescription>
          </CardHeader>
          <CardContent>
            <AssignRoleForm userId={userId} roles={allRoles || []} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Link href={`/admin/users/${userId}/permissions`}>
            <Button variant="outline">Manage User Permissions</Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline">Back to Users</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
