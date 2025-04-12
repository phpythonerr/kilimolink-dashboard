import Link from "next/link";
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Users,
  KeySquare,
  ScrollText,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage system access controls, users, roles, and permissions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Roles Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Role Management
            </CardTitle>
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardDescription className="px-6">
            Create and manage roles in the system.
          </CardDescription>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              Define roles like Admin, Manager, Staff and assign them
              permissions.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link
                href="/admin/roles"
                className="flex items-center justify-between"
              >
                <span>Manage Roles</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Permissions Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Permissions</CardTitle>
            <Lock className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardDescription className="px-6">
            Define system permissions.
          </CardDescription>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              Create granular permissions that control access to features and
              actions.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link
                href="/admin/permissions"
                className="flex items-center justify-between"
              >
                <span>Manage Permissions</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* User Access Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              User Management
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardDescription className="px-6">
            Manage users and their access rights.
          </CardDescription>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              View and manage users, assign roles and permissions.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link
                href="/admin/users"
                className="flex items-center justify-between"
              >
                <span>Manage Users</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* User Roles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Assign Roles</CardTitle>
            <UserCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              Assign roles to users based on their responsibilities within the
              organization.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link
                href="/admin/users"
                className="flex items-center justify-between"
              >
                <span>Assign User Roles</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Direct Permissions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Direct Permissions
            </CardTitle>
            <KeySquare className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              Assign specific permissions directly to users, bypassing role
              assignments.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link
                href="/admin/users"
                className="flex items-center justify-between"
              >
                <span>Manage User Permissions</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Access Audit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">
              Access Reports
            </CardTitle>
            <ScrollText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              View reports on user roles, permissions, and access patterns.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link
                href="/admin/access-reports"
                className="flex items-center justify-between"
              >
                <span>View Reports</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
