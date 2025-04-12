import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/app-datatable";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";

interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export const dynamic = "force-dynamic";

export default async function RolesPage({
  searchParams,
}: {
  searchParams: { page?: string; pageSize?: string };
}) {
  // Get pagination parameters from the URL
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;

  // Calculate pagination offset
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  // Fetch roles with pagination
  const {
    data: roles,
    count,
    error,
  } = await supabase
    .from("roles")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("name");

  if (error) {
    console.error("Error fetching roles:", error);
    throw new Error(`Failed to fetch roles: ${error.message}`);
  }

  // Calculate the total number of pages
  const pageCount = count ? Math.ceil(count / pageSize) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Role Management</h2>
          <p className="text-muted-foreground">
            Create and manage roles in the system
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/roles/new" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>New Role</span>
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={roles as Role[]}
        pageCount={pageCount}
        currentPage={page}
        pageSize={pageSize}
      />
    </div>
  );
}
