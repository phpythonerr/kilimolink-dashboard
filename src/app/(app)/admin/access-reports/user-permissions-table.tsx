import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { columns, type UserPermission } from "./user-permissions-columns";

export async function UserPermissionsTable({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const supabase = await createClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Only show staff users for security reasons
  const { data, error, count } = await supabase
    .from("user_permissions")
    .select(
      `
      id,
      user_id,
      permission_id,
      created_at,
      user:user_id (
        id,
        email,
        user_metadata
      ),
      permission:permission_id (
        id,
        name,
        description,
        category
      )
    `,
      { count: "exact" }
    )
    .eq("user.user_metadata->>user_type", "staff")
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user permissions:", error.message);
    throw new Error(`Failed to fetch user permissions: ${error.message}`);
  }

  // Calculate number of pages
  const pageCount = count ? Math.ceil(count / pageSize) : 0;

  return (
    <DataTable
      columns={columns}
      data={data as UserPermission[]}
      pageCount={pageCount}
      currentPage={page}
      pageSize={pageSize}
    />
  );
}
