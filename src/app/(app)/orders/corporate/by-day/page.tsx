import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AppBreadCrumbs } from "@/components/app-breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { DataTable } from "@/components/app-datatable";
import { columns } from "./columns";

export const metadata: Metadata = {
  title: "Corporate Orders By Day",
  description: "",
};

const breadcrumbs = [
  { label: "Home", href: "/" },
  { label: "Orders", href: "/orders" },
  { label: "Corporate", href: "/orders/corporate" },
  { label: "Order By Day", href: "/orders/corporate/by-day", current: true },
];

interface SearchParams extends Record<string, string> {}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Index({ searchParams }: any) {
  const supabase = await createClient();

  const queryParams = await searchParams;

  let pageSize: number = Number(queryParams.pageSize) || 10;

  let totalPages: number = 0;

  let page: number = 1;

  if (queryParams?.page && /^-?\d+$/.test(queryParams?.page)) {
    page = Number(queryParams?.page);
  }
  let { data: orders, error } = await supabase.rpc("get_daily_summary_v3", {
    page: page,
    page_size: pageSize,
  });

  let { data: totalDays, error: totalDaysError } = await supabase.rpc(
    "orders_by_day_count"
  );

  totalPages =
    totalDays[0].dates_count && Math.ceil(totalDays[0].dates_count / pageSize);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <AppBreadCrumbs items={breadcrumbs} />
        <div>
          <Button size="sm" asChild>
            <Link href="/orders/corporate/new">New Order</Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <DataTable
          data={orders || []}
          columns={columns}
          pageCount={totalPages}
          currentPage={page}
          pageSize={pageSize}
        />
      </Suspense>
    </div>
  );
}
