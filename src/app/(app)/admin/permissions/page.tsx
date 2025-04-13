import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/app-datatable";
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import Link from "next/link";
import { columns } from "./columns";

interface Permission {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  category?: string;
}

export const dynamic = "force-dynamic";

export default async function PermissionsPage({
  searchParams,
}: {
  searchParams: any;
}) {
  // Get pagination parameters from the URL
  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;
  const category = searchParams.category;

  // Calculate pagination offset
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  // Build query with filters
  let query = supabase.from("permissions").select("*", { count: "exact" });

  // Apply category filter if specified
  if (category) {
    query = query.eq("category", category);
  }

  // Apply pagination and ordering
  const {
    data: permissions,
    count,
    error,
  } = await query.range(from, to).order("name");

  if (error) {
    console.error("Error fetching permissions:", error);
    throw new Error(`Failed to fetch permissions: ${error.message}`);
  }

  // Get distinct categories for filtering
  const { data: categories } = await supabase
    .from("permissions")
    .select("category")
    .not("category", "is", null)
    .order("category");

  const uniqueCategories = Array.from(
    new Set(categories?.map((item: any) => item.category).filter(Boolean))
  );

  // Calculate the total number of pages
  const pageCount = count ? Math.ceil(count / pageSize) : 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Permission Management
          </h2>
          <p className="text-muted-foreground">
            Create and manage system permissions
          </p>
        </div>
        <Button asChild>
          <Link
            href="/admin/permissions/new"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>New Permission</span>
          </Link>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={permissions as Permission[]}
        pageCount={pageCount}
        currentPage={page}
        pageSize={pageSize}
      />
    </div>
  );
}
