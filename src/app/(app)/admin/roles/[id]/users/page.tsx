import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { notFound } from "next/navigation";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface UserWithProfile {
  id: string;
  email: string;
  profile: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    user_type?: string;
  };
  created_at: string;
  role_assignment: {
    created_at: string;
  };
}

export default async function UsersWithRolePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string; pageSize?: string };
}) {
  const supabase = await createClient();

  // Get pagination parameters from the URL
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;

  // Calculate pagination offset
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Fetch the role details first
  const { data: role, error: roleError } = await supabase
    .from("roles")
    .select("*")
    .eq("id", params.id)
    .single();

  if (roleError || !role) {
    console.error("Error fetching role:", roleError?.message);
    notFound();
  }

  // Fetch users with this role using a join between user_roles, auth.users, and profiles
  const {
    data: usersWithRole,
    count,
    error,
  } = await supabase
    .from("user_roles")
    .select(
      `
      id,
      created_at,
      user:user_id (
        id,
        email,
        created_at,
        profile:profiles (
          id,
          first_name,
          last_name,
          avatar_url,
          user_type
        )
      )
    `,
      { count: "exact" }
    )
    .eq("role_id", params.id)
    .eq("user.profile.user_type", "staff") // Only include staff users
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching users with role:", error);
    throw new Error(`Failed to fetch users with role: ${error.message}`);
  }

  // Transform the data to match the expected format
  const formattedUsers =
    usersWithRole?.map((item) => ({
      id: item.user.id,
      email: item.user.email,
      profile: item.user.profile,
      created_at: item.user.created_at,
      role_assignment: {
        created_at: item.created_at,
      },
    })) || [];

  // Calculate the total number of pages
  const pageCount = count ? Math.ceil(count / pageSize) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <Button variant="ghost" size="sm" className="w-fit" asChild>
          <Link href="/admin/roles" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Roles</span>
          </Link>
        </Button>

        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Users with Role: {role.name}
            </h2>
            <p className="text-muted-foreground">
              {role.description || "No description provided"}
            </p>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={formattedUsers}
        pageCount={pageCount}
        currentPage={page}
        pageSize={pageSize}
      />
    </div>
  );
}
