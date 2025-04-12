import { createClient } from "@/lib/supabase/server";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { User } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

interface UserWithMetadata extends User {
  user_metadata: {
    first_name?: string;
    last_name?: string;
    avatar?: string;
    business_name?: string;
    user_type?: string;
  };
  app_metadata: {
    role?: string;
  };
}

export default async function AdminUsersPage() {
  const supabase = await createClient();

  // Fetch users from Supabase
  const { data: staffUsers, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_type", "staff")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
        <p className="text-muted-foreground">
          Manage staff users and their access rights
        </p>
      </div>

      <DataTable columns={columns} data={staffUsers} />
    </div>
  );
}
