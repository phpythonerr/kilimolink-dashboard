import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { columns, type RolePermission } from "./role-permissions-columns";

export async function RolePermissionsTable({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) {
  const supabase = await createClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from("role_permissions")
    .select(
      `
      id,
      role_id,
      permission_id,
      created_at,
      role:role_id (
        id,
        name,
        description
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
    .range(from, to)
    .order("role_id");

  if (error) {
    console.error("Error fetching role permissions:", error.message);
    throw new Error(`Failed to fetch role permissions: ${error.message}`);
  }

  // Calculate number of pages
  const pageCount = count ? Math.ceil(count / pageSize) : 0;

  return (
    <DataTable
      columns={columns}
      data={data as RolePermission[]}
      pageCount={pageCount}
      currentPage={page}
      pageSize={pageSize}
    />
  );
}
