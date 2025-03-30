import React from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { DataTable } from "@/components/app-datatable";
import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Logistics Vehicles Reports",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Reports", href: "/reports" },
  { label: "Logistics", href: "/reports/logistics" },
  { label: "Vehicles", href: "/reports/logistics/vehicles", current: true },
];

export default async function Page({ searchParams }: any) {
  const queryParams = await searchParams;

  const supabase = await createClient();

  let pageSize: number = Number(queryParams.pageSize) || 10;

  let totalPages: number = 0;

  let page: number = 1;

  let query: any = supabase
    .rpc("get_vehicles_expenses_report")
    .order("transport_this_month", { ascending: false });

  if (queryParams?.page && /^-?\d+$/.test(queryParams?.page)) {
    page = Number(queryParams?.page);
    let offsetStart = Number(pageSize) * Number(Number(page) - 1);

    let offsetEnd = Number(pageSize) * Number(Number(page) - 1) + pageSize;

    query = query.range(offsetStart + 1, offsetEnd);
  } else {
    query = query.range(0, pageSize);
  }

  let { data: all, error, count: total } = await query;

  totalPages = total && Math.ceil(total / pageSize);
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
      </div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <DataTable
          data={all || []}
          columns={columns}
          pageCount={totalPages}
          currentPage={page}
          pageSize={pageSize}
        />
      </React.Suspense>
    </div>
  );
}
